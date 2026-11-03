/**
 * Om `uri` er et bilde expo-image-picker selv har lagt i appens cache.
 *
 * Bot-flyten er Expo Router-ruter, så en dyplenke kan sette `imageUri` til
 * hva som helst, og bekreft-skjermen laster opp det den får ved «Gi bot».
 * Derfor godtas bare filer velgeren har skrevet.
 *
 * expo-image-picker 58 skriver hvert bilde til
 * `<cache>/ImagePicker/<UUID>.<endelse>` og gir det som `file://`-URI, på
 * begge plattformer: iOS i `MediaHandler.generateUrl`, Android i
 * `createOutputFile` via `FileUtilities.generateOutputPath`. Cache-URI-en
 * (`Paths.cache.uri`) er bygget på samme måte, så prefikset stemmer tegn for
 * tegn. Resten må være ett filnavn, så `..` og undermapper ikke slipper gjennom.
 */
const PICKER_FILE_NAME = /^[A-Za-z0-9-]+\.[A-Za-z0-9]+$/;

export function isPickerCacheUri(uri: string, cacheDirUri: string): boolean {
    if (!cacheDirUri.startsWith("file://")) return false;
    const base = cacheDirUri.endsWith("/") ? cacheDirUri : `${cacheDirUri}/`;
    const prefix = `${base}ImagePicker/`;
    if (!uri.startsWith(prefix)) return false;
    return PICKER_FILE_NAME.test(uri.slice(prefix.length));
}
