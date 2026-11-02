import { afterEach, describe, expect, it, jest } from "@jest/globals";
// Intern sti med vilje: endrer Expo prefikset «fetch failed» eller flytter
// klassen, feiler testen under SDK-oppgraderingen i stedet for at brukerne
// stille får feil melding.
import { FetchError } from "expo/src/winter/fetch/FetchErrors";
import { NetworkError, request } from "./network";

const originalFetch = globalThis.fetch;

afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
});

describe("request", () => {
    it("gir svaret videre, også med feilstatus", async () => {
        const response = new Response(null, { status: 503 });
        globalThis.fetch = jest.fn(async () => response) as typeof fetch;

        await expect(request("https://photon.test/api")).resolves.toBe(response);
    });

    it("gjør en nettfeil om til NetworkError", async () => {
        globalThis.fetch = jest.fn(async () => {
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
        globalThis.fetch = jest.fn(async () => {
            throw abort;
        }) as typeof fetch;

        await expect(
            request("https://photon.test/api", { signal: controller.signal }),
        ).rejects.toBe(abort);
    });

    it("gjør React Natives nettfeil om til NetworkError", async () => {
        globalThis.fetch = jest.fn(async () => {
            throw new TypeError("Network request failed");
        }) as typeof fetch;

        await expect(request("https://photon.test/api")).rejects.toBeInstanceOf(
            NetworkError,
        );
    });

    it("forkler ikke andre feil som nettfeil", async () => {
        const consoleError = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});
        const original = new Error("Unsupported FormDataPart implementation");
        globalThis.fetch = jest.fn(async () => {
            throw original;
        }) as typeof fetch;

        const error = await request("https://photon.test/api").catch(
            (e: unknown) => e,
        );

        expect(error).not.toBeInstanceOf(NetworkError);
        expect((error as Error).message).toBe(
            "Noe gikk galt med forespørselen. Prøv igjen.",
        );
        expect((error as Error & { cause?: unknown }).cause).toBe(original);
        expect(consoleError).toHaveBeenCalled();
    });

    it("kjenner igjen nettfeil fra expo/fetch", async () => {
        globalThis.fetch = jest.fn(async () => {
            throw new FetchError("java.net.ConnectException");
        }) as typeof fetch;

        await expect(request("https://photon.test/api")).rejects.toBeInstanceOf(
            NetworkError,
        );
    });
});
