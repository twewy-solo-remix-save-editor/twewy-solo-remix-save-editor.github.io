import * as twewy from "./twewy.mjs"

const $ = document.querySelector.bind(document);

const fileSelect = $('#save-file-select')

function toTitleCase(str) {return str.charAt(0).toUpperCase() + str.slice(1) }

function showError(message) {
    const errorModal = $('#error-modal')
    errorModal.querySelector('p').innerText = message
    errorModal.showModal();
}

function readFileInput(fileList) {
  for (const file of fileList) {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', e => {
        const saveFileBuffer = e.target.result
        const saveFileData = twewy.readSaveFile(saveFileBuffer)
        if (saveFileData) {
            console.log(saveFileData)
            const saveFileSelectLabel = $('#save-file-select-label')
            saveFileSelectLabel.innerHTML = "Click the pin again after making edits to download the modified <code>game.dat</code>.<br/>Please refresh the page to edit a different save file."
            saveFileSelectLabel.style.color='red'
            fileSelect.classList.add('file-download')
            fileSelect.addEventListener('click', e => {
                e.preventDefault()
                e.stopImmediatePropagation()
                writeFileOutput(saveFileBuffer)
            })
            populateCharacterStatsUI(saveFileData)
            populatePinStockpileUI(saveFileData)
            populatePinMasteredUI(saveFileData)
        }
        else {
            showError("ERROR: The provided file does not appear to be a TWEWY game.dat save file.")
        }
    });
    fileReader.readAsArrayBuffer(file);
  }
}


async function writeFileOutput(saveFileBuffer) {
    const newSaveFileData = {
        playerCharacterStats: readCharacterStatsUI(),
        pinStockpile: readPinStockpileUI(),
        pinMastered: readPinMasteredUI(),
    }
    const newSaveFileBuffer = await twewy.writeSaveFile(saveFileBuffer, newSaveFileData)
    const blob = new Blob([saveFileBuffer]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = "game.dat";
    link.click();
}


fileSelect.addEventListener('change', event => { readFileInput(event.target.files) });

fileSelect.addEventListener('dragover', event => { event.stopPropagation();
                                                   event.preventDefault();
                                                   event.dataTransfer.dropEffect = 'copy'; });

fileSelect.addEventListener('drop', event => {event.stopPropagation();
                                              event.preventDefault();
                                              readFileInput(event.dataTransfer.files)} );

const pinSelectDataList = document.createElement('datalist')
pinSelectDataList.id='pin-datalist'
for (const [pinId, pinName] of Object.entries(twewy.PIN_DATA)) {
    const pinSelectOption = document.createElement('option')
    pinSelectOption.value = `${pinId.padStart(3, '0')}: ${pinName}`
    pinSelectDataList.appendChild(pinSelectOption)
}
document.body.appendChild(pinSelectDataList)


/*************************************** Character Stats UI ***************************************/

const nekuSaveDataIdsToFieldsMap = {
    "neku-attack": "nekuBaseAttack",
    "neku-defense": "nekuBaseDefense",
    "neku-luck": "nekuLuck",
    "neku-bravery": "nekuBravery",
    "neku-level-max": "nekuMaxLevel",
    "neku-level-offset": "nekuCurrentLevel",
    "neku-exp": "nekuExp",
    "money": "money",
}
const partnerSaveDataNamesToFieldsMap = {
    "attack": "BaseAttack",
    "defense": "BaseDefense",
    "sync": "Sync",
    "bravery": "Bravery",
}

function populateCharacterStatsUI(saveFileData) {
    const characterStatsSection = $("#character-stats")

    const nekuStatsTemplate = $("#neku-stats-template")
    const nekuStats = nekuStatsTemplate.cloneNode(/*deep=*/true).content.firstElementChild

    for (const [id, field] of Object.entries(nekuSaveDataIdsToFieldsMap)) {
        nekuStats.querySelector(`#${id}`).value = saveFileData.playerCharacterStats[field]
    }
    characterStatsSection.appendChild(nekuStats)


    const partnerStatsTemplate = $("#partner-stats-template")
    
    for (const partner of ['shiki', 'joshua', 'beat']) {
        const partnerStats = partnerStatsTemplate.cloneNode(/*deep=*/true).content.firstElementChild
        partnerStats.id = `${partner}-stats`
        partnerStats.querySelector('img').src = `/img/characters/${partner}.png`
        partnerStats.querySelector('legend').innerText = toTitleCase(partner)
        for (const [name, field] of Object.entries(partnerSaveDataNamesToFieldsMap)) {
            const partnerField = `${partner}${field}`
            const partnerFieldValue = saveFileData.playerCharacterStats[partnerField]
            partnerStats.querySelector(`input[name="${name}"`).value = partnerFieldValue
        }
        characterStatsSection.appendChild(partnerStats)
    }
    $("#character-stats-wrapper").removeAttribute('hidden')
}


function readCharacterStatsUI() {
    const nekuStats = $('#neku-stats')
    const playerCharacterStats = {}
    for (const [id, field] of Object.entries(nekuSaveDataIdsToFieldsMap)) {
        playerCharacterStats[field] = parseInt(nekuStats.querySelector(`#${id}`).value )
    }
    for (const partner of ['shiki', 'joshua', 'beat']) {
        const partnerStats = $(`#${partner}-stats`)
        for (const [name, field] of Object.entries(partnerSaveDataNamesToFieldsMap)) {
            const partnerStatValue = partnerStats.querySelector(`input[name="${name}"`).value
            const partnerField = `${partner}${field}`
            playerCharacterStats[partnerField] = parseInt(partnerStatValue)
        }
    }

    return playerCharacterStats
}


/**************************************** Pin Stockpile UI ****************************************/

const pinNumberRegex = RegExp(/^\d{3}/);

function pinTypeInputHandler(event) {
    const pinNumber = pinNumberRegex.exec(event.target.value)?.[0]
    if (!pinNumber) return;
    const pinName = twewy.PIN_DATA[parseInt(pinNumber)]
    if (!pinName) return;
    event.target.closest('fieldset').querySelector('img').src=`/img/pins/${pinNumber}.png`
    event.target.value = `${pinNumber}: ${pinName}`
}

function populatePinStockpileUI(saveFileData) {
    const pinStockpileSection = $("#pin-stockpile")
    const pinStockpileSlotTemplate = $("#pin-stockpile-slot-template")
    saveFileData.pinStockpile.forEach((pin, pindex) => {
        const pinSlotClone = pinStockpileSlotTemplate.cloneNode(/*deep=*/true);
        const pinSlot = pinSlotClone.content.firstElementChild
        const pinNumber = String(pin.type).padStart(3,'0')
        const pinTypeInput = pinSlot.querySelector('input[name="type"]')
        pinTypeInput.addEventListener("input", pinTypeInputHandler)
        pinSlot.querySelector('legend').innerText = `Slot #${pindex+1}`
        if (pin.quantity) {
            pinSlot.querySelector('img').src = `/img/pins/${pinNumber}.png`
            pinSlot.querySelector('input[name="level"]').value = pin.level
            pinSlot.querySelector('input[name="bpp"]').value = pin.bpp
            pinSlot.querySelector('input[name="spp"]').value = pin.spp
            pinTypeInput.value = `${pinNumber}: ${pin.name}`
        }
        pinStockpileSection.appendChild(pinSlot)
    });
    $("#pin-stockpile-wrapper").removeAttribute('hidden')
}


function readPinStockpileUI(saveFileData) {
    const pinStockpileSlots = document.querySelectorAll('.pin-slot-stockpile')
    const pinStockpile = new Array(twewy.STOCKPILE_PIN_MAX_COUNT)

    pinStockpileSlots.forEach((pinSlot, pindex) => {
        const pin = {}
        const pinType = pinSlot.querySelector('input[name="type"]').value
        const pinNumber = pinNumberRegex.exec(pinType)?.[0]
        if (pinNumber) {
            pin.type = parseInt(pinNumber)-1
            pin.level = parseInt(pinSlot.querySelector('input[name="level"]').value)
            pin.bpp = parseInt(pinSlot.querySelector('input[name="bpp"]').value)
            pin.spp = parseInt(pinSlot.querySelector('input[name="spp"]').value)
            pin.quantity = 1 // Stockpile pins always quantity 1
        }
        else {
            pin.type = 0xffff
            pin.level = 0
            pin.quantity = 0
            pin.bpp = 0
            pin.spp = 0
        }
        pinStockpile[pindex] = pin
    })

    return pinStockpile
}


/**************************************** Mastered Pins UI ****************************************/

function populatePinMasteredUI(saveFileData) {
    const pinMasteredSection = $("#pin-mastered")
    const pinMasteredSlotTemplate = $("#pin-mastered-slot-template")
   
    saveFileData.pinMastered.forEach((pin, pindex) => {
        const pinSlotClone = pinMasteredSlotTemplate.cloneNode(/*deep=*/true);
        const pinSlot = pinSlotClone.content.firstElementChild
        const pinNumber = String(pin.type).padStart(3,'0')
        const pinTypeInput = pinSlot.querySelector('input[name="type"]')
        pinTypeInput.addEventListener("input", pinTypeInputHandler)
        pinSlot.querySelector('legend').innerText = `Slot #${pindex+1}`
        if (pin.type != 0xffff) {
            pinSlot.querySelector('img').src = `/img/pins/${pinNumber}.png`
            pinSlot.querySelector('input[name="level"]').value = pin.level
            pinSlot.querySelector('input[name="quantity"]').value = pin.quantity
            pinTypeInput.value = `${pinNumber}: ${pin.name}`
        }
        pinMasteredSection.appendChild(pinSlot)
    });
    $("#pin-mastered-wrapper").removeAttribute('hidden')
}


function readPinMasteredUI() {
    const pinMasteredSlots = document.querySelectorAll('.pin-slot-mastered')
    const pinMastered = new Array(twewy.MASTERED_PIN_MAX_COUNT)
    let pindex = 0;

    pinMasteredSlots.forEach((pinSlot, pindex) => {
      const pin = {}
      const pinType = pinSlot.querySelector('input[name="type"]').value
      const pinNumber = pinNumberRegex.exec(pinType)?.[0]
      if (pinNumber) {
          pin.type = parseInt(pinNumber)-1
          pin.level = parseInt(pinSlot.querySelector('input[name="level"]').value)
          pin.quantity = parseInt(pinSlot.querySelector('input[name="quantity"]').value)
          pin.isAllocated = 1
      }
      else {
          pin.type = 0xffff
          pin.level = 0
          pin.quantity = 0
          pin.isAllocated = 0
      }
      pinMastered[pindex] = pin
    })

    return pinMastered
}