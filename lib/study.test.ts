import { describe, it, expect } from "@jest/globals";
import { formatStudyLabel } from "./study";

describe("formatStudyLabel", () => {
    it("setter programmet og klassetrinnet sammen", () => {
        expect(formatStudyLabel("Digital forretningsutvikling", 2)).toBe(
            "Digital forretningsutvikling · 2. klasse",
        );
    });

    it("viser bare programmet når klassetrinnet mangler", () => {
        expect(formatStudyLabel("Dataingeniør", null)).toBe("Dataingeniør");
    });

    it("viser bare klassetrinnet når programmet mangler", () => {
        expect(formatStudyLabel(null, 2)).toBe("2. klasse");
    });

    it("gir null når begge mangler", () => {
        expect(formatStudyLabel(null, null)).toBeNull();
        expect(formatStudyLabel("", undefined)).toBeNull();
    });
});
