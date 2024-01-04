import * as byteops from './byteops.mjs'
import {PIN_DATA} from './twewy-pins.mjs'
export * from './twewy-pins.mjs';



const TWEWY_SAVE_FILE_MAGIC_HEADER = '\x19SubarAsikiKonosEkai000000'
const TWEWY_SAVE_FILE_MAGIC_HEADER_SIZE = TWEWY_SAVE_FILE_MAGIC_HEADER.length
const TWEWY_SAVE_FILE_DATA_INTEGRITY_HASH_SIZE = 32
const TWEWY_SAVE_FILE_BODY_OFFSET = (TWEWY_SAVE_FILE_MAGIC_HEADER_SIZE +
                                     TWEWY_SAVE_FILE_DATA_INTEGRITY_HASH_SIZE)


export function readSaveFile(saveFileBuffer) {
    if (!validateSaveFile(saveFileBuffer)) return false;
    const saveFileData = {}
    saveFileData.playerCharacterStats = parsePlayerCharacterStats(saveFileBuffer);
    saveFileData.pinStockpile = parsePinStockpile(saveFileBuffer);
    saveFileData.pinMastered = parsePinMastered(saveFileBuffer);
    return saveFileData
}


export async function writeSaveFile(saveFileBuffer, saveFileData) {
    packPlayerCharacterStats(saveFileBuffer, saveFileData.playerCharacterStats);
    packPinStockpile(saveFileBuffer, saveFileData.pinStockpile);
    packPinMastered(saveFileBuffer, saveFileData.pinMastered);
    await packSaveDataIntegrityHash(saveFileBuffer);
    return saveFileBuffer
}


async function computeSaveDataIntegrityHash(saveFileBuffer) {
    const saveFileBody = new Uint8Array(saveFileBuffer, TWEWY_SAVE_FILE_BODY_OFFSET)
    const hashBuffer = await crypto.subtle.digest('SHA-256', saveFileBody);
                    // TWEWY specific bit-mangling and stored little-endian
    const hashBytes = (new Uint8Array(hashBuffer)).reverse().map(e=>e^0xff) 
    return hashBytes
}


async function packSaveDataIntegrityHash(saveFileBuffer) {
    const dataIntegrityHash = await computeSaveDataIntegrityHash(saveFileBuffer);
    const hashSectionSubarray = new Uint8Array(saveFileBuffer,
                                               TWEWY_SAVE_FILE_MAGIC_HEADER_SIZE,
                                               TWEWY_SAVE_FILE_DATA_INTEGRITY_HASH_SIZE)
    dataIntegrityHash.forEach((e,i) => {hashSectionSubarray[i] = e})
    return
}


function validateSaveFile(saveFileBuffer) {
    const magicHeader = (new TextDecoder('utf-8')
                         .decode(new Uint8Array(saveFileBuffer,
                                                0, TWEWY_SAVE_FILE_MAGIC_HEADER_SIZE)));
    if (magicHeader === TWEWY_SAVE_FILE_MAGIC_HEADER) {
        return true
    }
    else {
        return false
    }

    // const saveFileDataHash = new Uint8Array(saveFileBuffer,
    //                                         TWEWY_SAVE_FILE_MAGIC_HEADER_SIZE,
    //                                         TWEWY_SAVE_FILE_DATA_INTEGRITY_HASH_SIZE)

    // const computedDataHash = await computeTwewySaveDataIntegrityHash(saveFileBuffer);

    // if (byteops.byteArraysAreEqual(saveFileDataHash, computedDataHash)) {
    //     console.log("TWEWY save data has matching data integrity hash.")
    // }
    // else return false
}


/**************************************** Character Stats ****************************************/

const SAVE_FILE_PLAYER_STATS_STRUCT = {
    /* magic header goes here, 26 bytes */
    /* data hash goes here, 32 bytes */
    nekuCurrentLevel: {type: 'Uint16'}, // max=100
    /* skip over unknown 4 bytes here */
    nekuMaxLevel:     {type: 'Uint16', offset:'+4'}, // max=100
    nekuExp:          {type: 'Uint32'},
    money:            {type: 'Uint32'},
    nekuBaseAttack:   {type: 'Uint16'},
    nekuBaseDefense:  {type: 'Uint16'},
    nekuLuck:         {type: 'Uint16'},
    nekuBravery:      {type: 'Uint16'}, // max = 999
    /* ... */
    shikiBaseAttack:  {type: 'Uint16', offset: 0x3b},
    shikiBaseDefense: {type: 'Uint16'},
    shikiSync:        {type: 'Uint16'}, // percentage * 10, i.e. 100.0% -> 1000 here
    shikiBravery:     {type: 'Uint16'}, // base is 110
    /* ... */
    joshuaBaseAttack: {type: 'Uint16', offset: 0x55},
    joshuaBaseDefense:{type: 'Uint16'},
    joshuaSync:       {type: 'Uint16'},
    joshuaBravery:    {type: 'Uint16'}, // base is 40
    /* ... */
    beatBaseAttack:   {type: 'Uint16', offset: 0x6f},
    beatBaseDefense:  {type: 'Uint16'},
    beatSync:         {type: 'Uint16'},
    beatBravery:      {type: 'Uint16'}, // base is 5
}

function parsePlayerCharacterStats(saveFileBuffer) {
    const dataView = new DataView(saveFileBuffer, TWEWY_SAVE_FILE_BODY_OFFSET);
    const playerCharacterStats = {}

    let bufferOffset = 0;
    for (const [attribute, attributeData] of Object.entries(SAVE_FILE_PLAYER_STATS_STRUCT)) {
        const attributeType = attributeData.type
        if (attributeData.offset) {
            if (typeof attributeData.offset === 'string' && attributeData.offset[0] == '+') {
                bufferOffset += (+attributeData.offset)
            }
            else bufferOffset = (+attributeData.offset)
        }
        const attributeTypeLength = attributeData.length ?? byteops.getTypeByteLength(attributeType)
        const attributeValue = dataView['get'+attributeType](bufferOffset, /*little_endian=*/true)
        playerCharacterStats[attribute] = attributeValue
        bufferOffset += attributeTypeLength
    }

    return playerCharacterStats
}


function packPlayerCharacterStats(saveFileBuffer, playerCharacterStats) {
    const dataView = new DataView(saveFileBuffer, TWEWY_SAVE_FILE_BODY_OFFSET);

    let bufferOffset = 0;
    for (const [attribute, attributeData] of Object.entries(SAVE_FILE_PLAYER_STATS_STRUCT)) {
        const attributeType = attributeData.type
        if (attributeData.offset) {
            if (typeof attributeData.offset === 'string' && attributeData.offset[0] == '+') {
                bufferOffset += (+attributeData.offset)
            }
            else bufferOffset = (+attributeData.offset)
        }
        const attributeTypeLength = attributeData.length ?? byteops.getTypeByteLength(attributeType)
        const attributeValue = playerCharacterStats[attribute]
        dataView['set'+attributeType](bufferOffset, attributeValue, /*little_endian=*/true)
        bufferOffset += attributeTypeLength
    }

    return playerCharacterStats
}


/***************************************** Pin Stockpile *****************************************/


const SAVE_FILE_PIN_STOCKPILE_STRUCT = {
    type: {type: 'Uint16'},
    level: {type: 'Uint16'},
    quantity: {type: 'Uint8'},
    battles: {type: 'Uint32'}, // Goes up 1 for every battle session, does not count chain battles
    bpp: {type: 'Uint16'},
    mpp: {type: 'Uint16'}, // MPP is not used in Solo Remix but not sure what else this could be.
    spp: {type: 'Uint16'},
}

const SAVE_FILE_PIN_STOCKPILE_STRUCT_SIZE = (
    Object
    .values(SAVE_FILE_PIN_STOCKPILE_STRUCT)
    .reduce((sum, atts) => sum+byteops.getTypeByteLength(atts.type), 0)
)

export const STOCKPILE_PIN_MAX_COUNT = 255
const SAVE_FILE_PIN_STOCKPILE_START = 0x131
const SAVE_FILE_PIN_STOCKPILE_END = (SAVE_FILE_PIN_STOCKPILE_START+
                                      (SAVE_FILE_PIN_STOCKPILE_STRUCT_SIZE*STOCKPILE_PIN_MAX_COUNT))

const SAVE_FILE_PIN_STOCKPILE_SIZE = SAVE_FILE_PIN_STOCKPILE_END - SAVE_FILE_PIN_STOCKPILE_START


function parsePinStockpile(saveFileBuffer) {
    const dataView = new DataView(saveFileBuffer, SAVE_FILE_PIN_STOCKPILE_START);
    let bufferOffset = 0;

    const pinStockpile = new Array(STOCKPILE_PIN_MAX_COUNT)
    let pinIndex = 0
    while (bufferOffset < SAVE_FILE_PIN_STOCKPILE_SIZE) {
        const pin = {}
        for (const [attribute, attributeData] of Object.entries(SAVE_FILE_PIN_STOCKPILE_STRUCT)) {
            const attributeType = attributeData.type
            const attributeTypeLength = byteops.getTypeByteLength(attributeType)
            pin[attribute] = dataView['get'+attributeType](bufferOffset, /*little_endian=*/true)
            bufferOffset += attributeTypeLength
        }
        if (pin.quantity) ++pin.type
        pin.name = PIN_DATA[pin.type] ?? "NULL"
        pinStockpile[pinIndex] = pin
        ++pinIndex;
    }
    return pinStockpile
}


function packPinStockpile(saveFileBuffer, pinStockpile) {
    const dataView = new DataView(saveFileBuffer, SAVE_FILE_PIN_STOCKPILE_START);
    let bufferOffset = 0;

    for (const pin of pinStockpile) {
        for (const [attribute, attributeData] of Object.entries(SAVE_FILE_PIN_STOCKPILE_STRUCT)) {
            const attributeType = attributeData.type
            const attributeTypeLength = byteops.getTypeByteLength(attributeType)
            const attributeValue = pin[attribute]
            if (attributeValue != null) {
                dataView['set'+attributeType](bufferOffset, attributeValue, /*little_endian=*/true)
            }
            bufferOffset += attributeTypeLength
        }
    }
}


/***************************************** Mastered Pins *****************************************/


const SAVE_FILE_PIN_MASTERED_STRUCT = {
    type: {type: 'Uint16'},
    level: {type: 'Uint16'},
    isAllocated: {type: 'Uint8'}, // Technically a boolean
    unknown: {type: 'Uint32'},  // Unknown what data this is
    quantity: {type: 'Uint16'},
}

const SAVE_FILE_PIN_MASTERED_STRUCT_SIZE = (
    Object
    .values(SAVE_FILE_PIN_MASTERED_STRUCT)
    .reduce((sum, atts) => sum+byteops.getTypeByteLength(atts.type), 0)
)

const SAVE_FILE_PIN_MASTERED_START = 0x1031
export const MASTERED_PIN_MAX_COUNT = 320
// const SAVE_FILE_PIN_MASTERED_END = 0x1e10
// const SAVE_FILE_PIN_MASTERED_SIZE = SAVE_FILE_PIN_MASTERED_END - SAVE_FILE_PIN_MASTERED_START
const SAVE_FILE_PIN_MASTERED_SIZE = MASTERED_PIN_MAX_COUNT * SAVE_FILE_PIN_MASTERED_STRUCT_SIZE
// export const MASTERED_PIN_MAX_COUNT = parseInt(SAVE_FILE_PIN_MASTERED_SIZE/
//                                         SAVE_FILE_PIN_MASTERED_STRUCT_SIZE)

function parsePinMastered(saveFileBuffer) {
    const dataView = new DataView(saveFileBuffer, SAVE_FILE_PIN_MASTERED_START);
    let bufferOffset = 0;

    const pinMastered = new Array(MASTERED_PIN_MAX_COUNT)
    let pinIndex = 0
    while (bufferOffset < SAVE_FILE_PIN_MASTERED_SIZE) {
        const pin = {}
        for (const [attribute, attributeData] of Object.entries(SAVE_FILE_PIN_MASTERED_STRUCT)) {
            const attributeType = attributeData.type
            const attributeTypeLength = byteops.getTypeByteLength(attributeType)
            pin[attribute] = dataView['get'+attributeType](bufferOffset, /*little_endian=*/true)
            bufferOffset += attributeTypeLength
        }
        if (pin.type != 0xffff) ++pin.type
        pin.name = PIN_DATA[pin.type] ?? "NULL"
        pinMastered[pinIndex] = pin
        ++pinIndex;
    }
    return pinMastered
}


function packPinMastered(saveFileBuffer, pinMastered) {
    const dataView = new DataView(saveFileBuffer, SAVE_FILE_PIN_MASTERED_START);
    let bufferOffset = 0;
    
    for (const pin of pinMastered) {
        for (const [attribute, attributeData] of Object.entries(SAVE_FILE_PIN_MASTERED_STRUCT)) {
            const attributeType = attributeData.type
            const attributeTypeLength = byteops.getTypeByteLength(attributeType)
            const attributeValue = pin[attribute]
            if (attributeValue != null) {
                dataView['set'+attributeType](bufferOffset, attributeValue, /*little_endian=*/true)
            }
            bufferOffset += attributeTypeLength
        }
    }
    
    return pinMastered
}