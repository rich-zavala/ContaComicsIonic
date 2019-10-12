
# Conta Comics Ionic

Conta Comics is a software specially made to ease the management of comic books collection. Mainly to avoid the acquisition of duplicate volumes.
Based on Ionic 5 it can run in both local browser or Android device.

It allows the registry of records with the following fields:
- Title
- Volumen
- Price
- Format (Staples, TP, HC, Monster or Manga)
- Variant
- Language (Spanish or English)
- Publish date
- Is this in your shelf? (Owned)
- Is it read?
- Provider
- Comments

## For management there are two screens:
Group by date: Sorts the records agrouped by year and date of the "publish date" field.
Group by serie: Lists the collection by serie title name.
Filter by "All, Owned, Not Owned" is available in both screens.

## Other features:
- Create, edit and delete records
- Does not allow duplicate records of "Title + Volumen + Variant" combination
- Mark a record as "Owned" and "Is read".
- Export database to local file (Android only)
- Import database (Android only with options "Only new records", "Replace current records", "Clean all and import")
- Full offline functionality
- Available in Spanish and English

## Specs:
- Ionic 5
- Angular 7
- Cordoba 8

## Debugging
To start android emulator
>cordova run --emulator

To initialize debugger
>ionic cordova run android -l --address <LOCAL IP> --debug --emulator --verbose

Open Chrome inspector
>https://medium.com/@coderonfleek/debugging-an-ionic-android-app-using-chrome-dev-tools-6e139b79e8d2

In "Remote devices" locate the emulator device and click "Inspect" button located at the extreme right of the "Ionic App" row.

## Local workarounds
Installing an **Ionic + Android** application could be problematic, so here are some tips to fix ContaComics and make the development environment setup quickly:

* Add missing cordoba dialogs
>cordova plugin add cordova-plugin-dialogs

* Execute `./rebuild.sh` to clean the local setup and do a new installation
