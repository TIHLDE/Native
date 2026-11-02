import { describe, it, expect } from "@jest/globals";
import { isPickerCacheUri } from "./pickerImage";

const IOS_CACHE =
    "file:///var/mobile/Containers/Data/Application/0A1B2C3D-0000-4000-8000-000000000000/Library/Caches/";
const ANDROID_CACHE = "file:///data/user/0/org.tihlde.app/cache/";

describe("isPickerCacheUri", () => {
    it("godtar bilder velgeren har skrevet på iOS", () => {
        expect(
            isPickerCacheUri(
                `${IOS_CACHE}ImagePicker/5F0C1E2A-3B4D-4E5F-8A9B-0C1D2E3F4A5B.jpg`,
                IOS_CACHE,
            ),
        ).toBe(true);
    });

    it("godtar bilder velgeren har skrevet på Android", () => {
        expect(
            isPickerCacheUri(
                `${ANDROID_CACHE}ImagePicker/5f0c1e2a-3b4d-4e5f-8a9b-0c1d2e3f4a5b.jpeg`,
                ANDROID_CACHE,
            ),
        ).toBe(true);
    });

    it("tåler en cache-URI uten avsluttende skråstrek", () => {
        expect(
            isPickerCacheUri(
                `${ANDROID_CACHE}ImagePicker/abc-123.png`,
                ANDROID_CACHE.slice(0, -1),
            ),
        ).toBe(true);
    });

    it.each([
        ["en annen fil i cachen", `${IOS_CACHE}secret.jpg`],
        ["en undermappe", `${IOS_CACHE}ImagePicker/sub/a.jpg`],
        ["en sti ut av mappa", `${IOS_CACHE}ImagePicker/../../Documents/a.jpg`],
        ["kodet sti ut av mappa", `${IOS_CACHE}ImagePicker/%2E%2E%2Fa.jpg`],
        ["en ekstern URL", "https://example.com/ImagePicker/a.jpg"],
        ["en content://-URI", "content://media/external/images/1"],
        ["selve mappa", `${IOS_CACHE}ImagePicker/`],
        ["et filnavn uten endelse", `${IOS_CACHE}ImagePicker/abc`],
        ["en tom streng", ""],
    ])("avviser %s", (_, uri) => {
        expect(isPickerCacheUri(uri, IOS_CACHE)).toBe(false);
    });

    it("avviser alt når cache-URI-en ikke er en fil-URI", () => {
        expect(isPickerCacheUri("ImagePicker/a.jpg", "")).toBe(false);
    });
});
