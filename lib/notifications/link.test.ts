import { describe, it, expect, jest, beforeEach } from "@jest/globals";

const mockFetchEvent = jest.fn<(identifier: string) => Promise<{ id: number }>>();

jest.mock("@/actions/events/events", () => ({
    fetchEvent: (identifier: string) => mockFetchEvent(identifier),
}));

import { toAppRoute } from "./link";

const FINES_DRIFT = "/(modals)/gruppe/drift?tab=fines";

describe("toAppRoute", () => {
    beforeEach(() => {
        mockFetchEvent.mockReset();
    });

    describe("bøtelenker", () => {
        it("åpner bøtefanen for den nye formen", async () => {
            expect(await toAppRoute("/grupper/drift/boter")).toBe(FINES_DRIFT);
        });

        it("åpner bøtefanen for den gamle formen", async () => {
            expect(await toAppRoute("/grupper/drift?tab=boter")).toBe(
                FINES_DRIFT,
            );
        });

        it("kutter opprinnelsen fra en absolutt lenke", async () => {
            expect(
                await toAppRoute("https://tihlde.org/grupper/drift/boter"),
            ).toBe(FINES_DRIFT);
            expect(
                await toAppRoute("https://tihlde.org/grupper/drift?tab=boter"),
            ).toBe(FINES_DRIFT);
        });

        it("ser bort fra nettsidens filtre", async () => {
            expect(
                await toAppRoute("/grupper/drift/boter?botStatus=paid"),
            ).toBe(FINES_DRIFT);
        });

        it("gir samme rute for æøå i relativ og absolutt lenke, kodet én gang", async () => {
            const expected = `/(modals)/gruppe/${encodeURIComponent("bøtegruppa-æøå")}?tab=fines`;

            const relative = await toAppRoute("/grupper/bøtegruppa-æøå/boter");
            const absolute = await toAppRoute(
                "https://tihlde.org/grupper/bøtegruppa-æøå/boter",
            );

            expect(relative).toBe(expected);
            expect(absolute).toBe(expected);
            expect(absolute).not.toContain("%25");
        });

        it("tåler en ødelagt %-sekvens", async () => {
            expect(await toAppRoute("/grupper/drift%E0/boter")).toBe(
                "/(modals)/gruppe/drift%25E0?tab=fines",
            );
        });
    });

    describe("lenker uten skjerm", () => {
        it("gir null for andre gruppelenker", async () => {
            expect(await toAppRoute("/grupper/drift")).toBeNull();
            expect(await toAppRoute("/grupper/drift/lovverk")).toBeNull();
        });

        it("gir null uten lenke", async () => {
            expect(await toAppRoute(null)).toBeNull();
            expect(await toAppRoute(undefined)).toBeNull();
            expect(await toAppRoute("")).toBeNull();
        });
    });

    describe("arrangementslenker", () => {
        it("bytter slugen ut med id-en", async () => {
            mockFetchEvent.mockResolvedValue({ id: 42 });
            expect(await toAppRoute("/arrangementer/julebord")).toBe(
                "/(modals)/arrangement/42",
            );
            expect(mockFetchEvent).toHaveBeenCalledWith("julebord");
        });

        it("gir null når arrangementet ikke finnes", async () => {
            mockFetchEvent.mockRejectedValue(new Error("404"));
            expect(await toAppRoute("/arrangementer/borte")).toBeNull();
        });
    });
});
