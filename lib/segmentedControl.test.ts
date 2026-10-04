import { describe, it, expect } from "@jest/globals";
import { CONTROL_PADDING, segmentWidth } from "./segmentedControl";

describe("segmentWidth", () => {
    it("er udefinert for en bryter som ikke skal rulle", () => {
        expect(
            segmentWidth({
                scrollable: false,
                containerWidth: 400,
                labelWidths: [80, 80],
                optionCount: 2,
            })
        ).toBeUndefined();
    });

    it("er udefinert før beholderen er målt", () => {
        expect(
            segmentWidth({
                scrollable: true,
                containerWidth: 0,
                labelWidths: [],
                optionCount: 4,
            })
        ).toBeUndefined();
    });

    it("deler bredden likt når alle tekstene får plass", () => {
        expect(
            segmentWidth({
                scrollable: true,
                containerWidth: 408,
                labelWidths: [60, 100, 70, 80],
                optionCount: 4,
            })
        ).toBe((408 - CONTROL_PADDING) / 4);
    });

    it("gir alle den lengste teksten når den ikke får plass", () => {
        expect(
            segmentWidth({
                scrollable: true,
                containerWidth: 320,
                labelWidths: [60, 120, 70, 80],
                optionCount: 4,
            })
        ).toBe(120);
    });

    it("ser bort fra mål for valg som ikke lenger finnes", () => {
        // Fra fire faner til to: den gamle, brede «Medlemmer» på plass 3 skal
        // ikke trekke bredden opp.
        expect(
            segmentWidth({
                scrollable: true,
                containerWidth: 328,
                labelWidths: [40, 60, 300, 90],
                optionCount: 2,
            })
        ).toBe((328 - CONTROL_PADDING) / 2);
    });

    it("tåler at ingenting er målt ennå", () => {
        expect(
            segmentWidth({
                scrollable: true,
                containerWidth: 328,
                labelWidths: [],
                optionCount: 2,
            })
        ).toBe((328 - CONTROL_PADDING) / 2);
    });
});
