import { toAppRoute } from "@/lib/notifications/link";

jest.mock("@/actions/events/events", () => ({
    fetchEvent: jest.fn(),
}));

const { fetchEvent } = require("@/actions/events/events") as {
    fetchEvent: jest.Mock;
};

describe("toAppRoute", () => {
    beforeEach(() => {
        fetchEvent.mockReset();
    });

    it("bytter slugen i arrangementslenken med id-en skjermen trenger", async () => {
        fetchEvent.mockResolvedValue({ id: "3f1c-uuid" });

        // Photon skriver noen lenker absolutte og andre relative.
        await expect(toAppRoute("/arrangementer/vaffelsalg")).resolves.toBe(
            "/(modals)/arrangement/3f1c-uuid",
        );
        await expect(
            toAppRoute("https://tihlde.org/arrangementer/vaffelsalg"),
        ).resolves.toBe("/(modals)/arrangement/3f1c-uuid");
    });

    it("gir null når arrangementet ikke finnes", async () => {
        fetchEvent.mockRejectedValue(new Error("404"));

        await expect(toAppRoute("/arrangementer/slettet")).resolves.toBeNull();
    });

    it("tar bøtefanen på gruppelenken", async () => {
        await expect(
            toAppRoute("/grupper/drift?tab=boter"),
        ).resolves.toBe("/(modals)/boter/drift");
    });

    it("gir null for skjermer appen ikke har", async () => {
        // Gruppesider uten bøtefanen, nyheter og tomme lenker skal åpne appen
        // som vanlig framfor å sende brukeren til en tilfeldig skjerm.
        await expect(toAppRoute("/grupper/drift")).resolves.toBeNull();
        await expect(toAppRoute("/nyheter/123")).resolves.toBeNull();
        await expect(toAppRoute(null)).resolves.toBeNull();
    });
});
