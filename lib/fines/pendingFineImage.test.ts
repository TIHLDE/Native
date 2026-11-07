import { describe, it, expect, beforeEach } from "@jest/globals";
import {
    clearPendingFineImage,
    getPendingFineImage,
    putPendingFineImage,
} from "./pendingFineImage";

const first = { uri: "file:///cache/ImagePicker/a.jpg", width: 400, height: 300 };
const second = { uri: "file:///cache/ImagePicker/b.jpg", width: 300, height: 400 };

describe("pendingFineImage", () => {
    beforeEach(() => clearPendingFineImage());

    it("gir tilbake bildet for id-en put ga", () => {
        const id = putPendingFineImage(first);
        expect(getPendingFineImage(id)).toEqual(first);
    });

    it("gir null for en ukjent id", () => {
        putPendingFineImage(first);
        expect(getPendingFineImage("fra-en-dyplenke")).toBeNull();
    });

    it("gir null uten id", () => {
        putPendingFineImage(first);
        expect(getPendingFineImage(undefined)).toBeNull();
        expect(getPendingFineImage("")).toBeNull();
    });

    it("lar et nytt bilde erstatte det gamle", () => {
        const oldId = putPendingFineImage(first);
        const newId = putPendingFineImage(second);
        expect(newId).not.toBe(oldId);
        expect(getPendingFineImage(oldId)).toBeNull();
        expect(getPendingFineImage(newId)).toEqual(second);
    });

    it("gir null etter clear", () => {
        const id = putPendingFineImage(first);
        clearPendingFineImage();
        expect(getPendingFineImage(id)).toBeNull();
    });
});
