# The World Ends With You: Solo Remix Save Editor

[demo.webm](https://github.com/twewy-solo-remix-save-editor/twewy-solo-remix-save-editor.github.io/assets/139438929/8c996f6b-7fac-4e44-b5f6-f99c554727f1)

## About
This is a web application to perform basic editting of a `game.dat` save file for the Android version of The World Ends With You, known as The World Ends With You: Solo Remix. This project is not striving to be "feature-complete" and edit every piece of data, only the core gameplay elements such as player character stats and psych pins.

Note that while you "upload" your save file to this web application, **all code and binary parsing is executed on your machine**. Your save data is not actually being sent anywhere, it's just a basic and intuitive way of granting your web browser access to the file contents. This website is simply to make accessing the UI components easy, but you could just as effectively run these files on a local HTTPS server on your device.


## Disclaimer
This tool and website is in no way affiliated with Square Enix, h.a.n.d., or any other third parties.

All product and company names are trademarks&#8482; or registered&reg; trademarks of their respectve holders. Use of them does not imply any affiliation with or endorsement by them. Any content featured and shared here is done so without consent or knowledge of the copyright holders involved unless otherwise noted. Anything featured here does not represent the official works in any way and is made and distributed for free purely for educational, entertainment, and research purposes, which are protected under Section 107 of the Copyright Act.


## Credits
Thank you to these sites and posts for providing essential assets and resources that provided the foundation of this tool:

- https://www.spriters-resource.com/mobile/worldendswithyousoloremix/
- https://www.khinsider.com/the-world-ends-with-you/pins
- https://www.reddit.com/r/TWEWY/comments/9rjm3v/reverseengineering_the_savegame_file/
- https://www.reddit.com/r/TWEWY/comments/ogjbde/save_editing_addresses_for_twewy_final_remix/
- https://docs.google.com/spreadsheets/d/1c7aqkLregiy_7xEfsHCUwZZSXR-hnvfFE8p3RQv7tRE/

## App Features
- [x] Basic light/dark automatic theme based on CSS `prefers-color-scheme`
- [x] Drag and drop save file as well as basic file-selector "upload"
- [x] Edit general player progress stats like experience, level, money, etc
- [x] Edit player and partner combat stats
- [x] Edit pins in the stockpile tab
    - [x] Edit pin PP variants
- [x] Edit pins in the mastered tab
- [ ] Edit pins in the deck(s)
- [ ] Edit clothing and misc items
      

## Retreiving your `game.dat` TWEWY:SR save file from Android

> [!Important]
> Accessing the app's internal files requires installing the Android Debug Bridge and [Apktool](https://apktool.org/). Note that this specifically does not require root access. If you already have root access on your device, you can skip this process as you should be able to access the app's files as root.

> [!Warning]
> In the process of modifying the app to be debuggable, you will need to uninstall the non-modified version of the app. **This will delete any game saves on your device**. Since this process is literally to get access to this save data so you could back it up, the only way to avoid losing this data is to perform a system backup and then restore later. Proceed at your own risk.

1. Make the TWEWY:SR application on your Android debuggable. **This is needed if you do not have root access in order to access the app's private files.**

    In order to access the game's internal filesystem on your device, this will require decompiling your .apk file of TWEWY:SR, modifying the manifest so declare that the app is "debuggable", recompiling, and reinstalling the .apk file.

    1. Install the [Apktool](https://apktool.org/). On Arch Linux this can be done by installing the AUR package `android-apktool-bin`. See the website for installation instructions for your specific OS.

    1. Copy your .apk file for TWEWY:SR to the machine. I also recommend making a backup copy for safekeeping.

    1. Follow the instructions in this gist for the series of commands needed to make the app debuggable: https://gist.github.com/nstarke/615ca3603fdded8aee47fab6f4917826

    If you do **not** make the app debuggable, you will simply see errors similar to `run-as: Package 'com.mypackage' is not debuggable` when trying to access the game's internal files.


1. Once you have rebuilt the .apk file, copy it to your device. As mentioned in the above warning, you will need to uninstall any current version of TWEWY:SR which will also delete any saved data you have. Once the unmodified version is uninstalled, install the modified .apk file.

    You may also receive prompts warning of the app being unsafe. This is due to the fact the app was signed with a random key after rebuilding it. Choose the options to proceed anyway and the app should install.

    ![unsafe app blocked](https://github.com/twewy-solo-remix-save-editor/twewy-solo-remix-save-editor.github.io/assets/139438929/a176bc13-1bba-4ba2-bbf2-2c2b81ec84a6)

    ![install anyway](https://github.com/twewy-solo-remix-save-editor/twewy-solo-remix-save-editor.github.io/assets/139438929/15098463-cb72-4016-84d1-c7414a2b45cf)


1. Make sure the freshly installed debuggable version of the app has permission to access files and folders:
    ![app permissions](https://github.com/twewy-solo-remix-save-editor/twewy-solo-remix-save-editor.github.io/assets/139438929/8a79313c-9b82-4d85-aeed-10d1d5fbef3d)


1. Install the Android Debug Bridge on a controlling device. On Arch Linux this can be done by installing the package `android-tools`.


1. Enable USB and/or wireless debugging on your Android device. This is specific to each flavor of Android, so search for instructions specific to your device model. https://developer.android.com/studio/debug/dev-options

1. Confirm you can begin a debug session and access a shell by running `adb shell` with your device connected either via USB or on a wireless connection.
    
    If you are connected via USB you will likely get prompted on your Android device to confirm granting debugging access to the other device. Confirm this prompt if so.
    
    To use a wireless connection, here is a brief guide for establishing access using `adb`:
    
    1. On your Android device, enable "Wireless debugging" and chose "pair with a pairing code" or whatever similar option your device shows. Your device should then show a panel containing its IP address on the local network, the port it is accepting pairing connections on, and a 6-digit pairing code.

    ![pair with code](https://github.com/twewy-solo-remix-save-editor/twewy-solo-remix-save-editor.github.io/assets/139438929/8e7ad1f4-3842-4cb3-be61-3c447a0fdf8f)

    ![pairing code](https://github.com/twewy-solo-remix-save-editor/twewy-solo-remix-save-editor.github.io/assets/139438929/c838fad9-e494-4284-85a0-d5e690e47442)


    1. On your machine with `adb` installed, run `adb pair <IP>:<PORT> <PAIRING_CODE>` replacing the variables in <> with the respective values displayed on your Android device.

    1. Once your device is paired, notice your Android device is listening for wireless debugging connections **on a different port** than the previous step (but it will likely have the same IP). Notice this different port value, and use it in the following command to establish a wireless debugging connection: `adb connect <IP>:<NEWPORT>`

    1. You may get another prompt on your Android asking you to confirm granting debugging access. Accept this prompt if so.

    1. Validate the connection from your machine running `adb` by executing `adb shell` or `adb devices`. `shell` will open an interactive shell on your device if the connection is established.


1. With your `adb shell` session running, run the command `cmd package list packages`. Search for the name of your TWEWY:SE app's package name.
    
    My app's package name is `com.square_enix.android_googleplay.subarashikikonosekai_solo`. The US release of the app's package is named after the romanization of its Japanese name "Subarashiki Kono Sekai" which translates to "It's a Wonderful World". Make note of this package name as we will use it in the next step.

1. Verify you can "run as" the app, which was the point of making the application debuggable in previous steps. For my situation I run `run-as com.square_enix.android_googleplay.subarashikikonosekai_solo` to switch the app's permissions. Your shell prompt should change to something like: `z3q:/data/user/0/com.square_enix.android_googleplay.subarashikikonosekai_solo $` to indicate you are running as the app. Verify you can read the `game.dat` file by running `ls -l ./files/game.dat`. You should see that the file exists and you have read access to it:

    ```-rw-rw-rw- 1 u0_#### u0_#### 29188 2023-12-04 00:32 ./files/game.dat```

1. Exit the `adb` shell by using ctrl+D or running `exit` a few times.


At this point you have full access to your TWEWY:SE save file on your Android device.

Here is a one-liner to copy the `game.dat` on your device to your terminal's current working directory:
```sh
adb shell run-as com.square_enix.android_googleplay.subarashikikonosekai_solo cat files/game.dat > ./game.dat
```

Here is a one-liner to copy the `game.dat` file in your terminal's working directory to the internal files of the TWEWY:SE application on your Android device:
```sh
cat game.dat | adb shell run-as com.square_enix.android_googleplay.subarashikikonosekai_solo tee ./files/game.dat > /dev/null
```

Now you can use the `game.dat` you retrieved from your Android device and modify it at https://twewy-solo-remix-save-editor.github.io and then copy the editted save file back to your Android device.

Have fun!


## `imhex` pattern code

![imhex](https://github.com/twewy-solo-remix-save-editor/twewy-solo-remix-save-editor.github.io/assets/139438929/1989208d-42b5-46ee-8e39-5355763848d4)

This is the pattern code I have developed (so far) to reverse engineer the structure of the save file.

This is specifically for the [`imhex`](https://imhex.werwolv.net/) program:

<details>
    <summary><code>game.dat</code> pattern code</summary>
    
```C++
#include <std/io.pat>
#include <std/string.pat>

char magic_header[26] @ 0;
char integrity_hash[32] @ $;


struct player_stats_t {
    u16 neku_current_level_offset;
    u32 unknown;
    u16 neku_max_level; //max=100
    u32 neku_exp;
    u32 money;
    u16 neku_base_attack;
    u16 neku_base_defense;
    u16 neku_luck; //max=999
    u16 neku_bravery; //max=999
    
    padding[35];
    u16 shiki_base_attack;
    u16 shiki_base_defense;
    u16 shiki_sync;     // percentage * 10, i.e. 100.0% -> 1000 here
    u16 shiki_bravery;  // base is 11
    
    padding[18];
    u16 joshua_base_attack;
    u16 joshua_base_defense;
    u16 joshua_sync;     // percentage * 10, i.e. 100.0% -> 1000 here
    u16 joshua_bravery;  // base is 140

    padding[18];
    u16 beat_base_attack;
    u16 beat_base_defense;
    u16 beat_sync;     // percentage * 10, i.e. 100.0% -> 1000 here
    u16 beat_bravery;  // base is 5

};

player_stats_t player_stats @ $;

#define PIN_STOCKPILE_START 0x131
#define PIN_STOCKPILE_QUANTITY 256

struct stockpile_pin {
    u16 type;
    u16 level;
    u8  quantity;
    u32 battles_participated_in;
    u16 bpp;
    u16 mpp;
    u16 spp;
};

stockpile_pin stockpile_pins[PIN_STOCKPILE_QUANTITY] @ PIN_STOCKPILE_START;


#define PIN_MASTERED_START 0x1031
#define PIN_MASTERED_QUANTITY 320

struct mastered_pin {
    u16 type;
    u16 level;
    bool valid;
    u32 u;
    u16 quantity;
};

mastered_pin mastered_pins[PIN_MASTERED_QUANTITY] @ PIN_MASTERED_START;

//std::print("offset {:#x}",$);


#define PIN_DECK_START 0x1df1
#define PIN_DECK_QUANTITY 24

struct deck_pin {
    u16 type;
    u16 level;
    bool valid;
    u32 u;
    u16 quantity;
};

deck_pin deck_pins[PIN_DECK_QUANTITY] @ PIN_DECK_START;
```

</details>
