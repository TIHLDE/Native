import { describe, it, expect, jest } from "@jest/globals";
import { emitFineSubmitted, onFineSubmitted } from "./fine-events";

describe("fine-events", () => {
    it("varsler alle lyttere", () => {
        const a = jest.fn();
        const b = jest.fn();
        const offA = onFineSubmitted(a);
        const offB = onFineSubmitted(b);

        emitFineSubmitted();

        expect(a).toHaveBeenCalledTimes(1);
        expect(b).toHaveBeenCalledTimes(1);
        offA();
        offB();
    });

    it("varsler ikke en lytter som har meldt seg av", () => {
        const listener = jest.fn();
        const off = onFineSubmitted(listener);
        off();

        emitFineSubmitted();

        expect(listener).not.toHaveBeenCalled();
    });

    it("tåler at en lytter melder seg av underveis", () => {
        const second = jest.fn();
        const off = onFineSubmitted(() => off());
        const offSecond = onFineSubmitted(second);

        emitFineSubmitted();
        emitFineSubmitted();

        expect(second).toHaveBeenCalledTimes(2);
        offSecond();
    });
});
