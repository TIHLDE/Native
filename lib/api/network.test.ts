import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { NetworkError, request } from "./network";

const originalFetch = global.fetch;

afterEach(() => {
    global.fetch = originalFetch;
});

describe("request", () => {
    it("gir svaret videre, også med feilstatus", async () => {
        const response = new Response(null, { status: 503 });
        global.fetch = jest.fn(async () => response) as typeof fetch;

        await expect(request("https://photon.test/api")).resolves.toBe(response);
    });

    it("gjør en nettfeil om til NetworkError", async () => {
        global.fetch = jest.fn(async () => {
            throw new Error("fetch failed: java.net.ConnectException");
        }) as typeof fetch;

        await expect(request("https://photon.test/api")).rejects.toBeInstanceOf(
            NetworkError,
        );
    });

    it("lar et avbrutt kall kaste sin egen feil", async () => {
        const controller = new AbortController();
        controller.abort();
        const abort = new Error("Aborted");
        global.fetch = jest.fn(async () => {
            throw abort;
        }) as typeof fetch;

        await expect(
            request("https://photon.test/api", { signal: controller.signal }),
        ).rejects.toBe(abort);
    });
});
