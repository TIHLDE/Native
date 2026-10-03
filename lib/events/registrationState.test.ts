import { describe, it, expect } from "@jest/globals";
import type { Event, Registration } from "@/actions/types";
import {
    deriveRegistrationState,
    formatCountdown,
    formatTimeUntil,
    registrationErrorMessage,
} from "./registrationState";

const NOW = new Date("2026-08-20T12:00:00Z");
const past = (hours: number) =>
    new Date(NOW.getTime() - hours * 3600_000).toISOString();
const future = (hours: number) =>
    new Date(NOW.getTime() + hours * 3600_000).toISOString();

const event = (overrides: Partial<Event> = {}): Event => ({
    id: "e1",
    title: "Test",
    startDate: future(48),
    endDate: future(50),
    signUp: true,
    closed: false,
    limit: 0,
    listCount: "0",
    waitingListCount: "0",
    startRegistrationAt: past(1),
    endRegistrationAt: future(24),
    signOffDeadline: future(20),
    ...overrides,
});

const registration = (overrides: Partial<Registration> = {}): Registration => ({
    hasAttended: false,
    hasPaidOrder: false,
    hasUnansweredEvaluation: false,
    isOnWait: false,
    paymentExpireDate: "",
    paymentOrders: [],
    waitQueueNumber: 0,
    registrationId: 0,
    userInfo: { userId: "", firstName: "", lastName: "", email: "", gender: 0, study: { group: { name: "", slug: "", type: "" } }, studyyear: { group: { name: "", slug: "", type: "" } }, unansweredEvaluationsCount: 0 },
    status: "registered",
    ...overrides,
});

describe("deriveRegistrationState", () => {
    it("sier fra når arrangementet ikke har påmelding", () => {
        expect(
            deriveRegistrationState(event({ signUp: false }), null, NOW),
        ).toBe("no-signup");
    });

    it("er åpen innenfor påmeldingsvinduet", () => {
        expect(deriveRegistrationState(event(), null, NOW)).toBe("open");
    });

    it("er ikke åpnet før påmeldingen starter", () => {
        expect(
            deriveRegistrationState(
                event({ startRegistrationAt: future(2) }),
                null,
                NOW,
            ),
        ).toBe("not-open");
    });

    it("er stengt etter påmeldingsfristen", () => {
        expect(
            deriveRegistrationState(
                event({ endRegistrationAt: past(1) }),
                null,
                NOW,
            ),
        ).toBe("closed");
    });

    it("er stengt når arrangementet er over, selv om flagget ikke er satt", () => {
        expect(
            deriveRegistrationState(
                event({ startDate: past(5), endDate: past(3) }),
                null,
                NOW,
            ),
        ).toBe("closed");
    });

    it("er stengt når arrangøren har stengt manuelt", () => {
        expect(deriveRegistrationState(event({ closed: true }), null, NOW)).toBe(
            "closed",
        );
    });

    it("er fullt når plassene er tatt", () => {
        expect(
            deriveRegistrationState(
                event({ limit: 2, listCount: "2" }),
                null,
                NOW,
            ),
        ).toBe("full");
    });

    it("lar stengt gå foran fullt", () => {
        expect(
            deriveRegistrationState(
                event({ limit: 2, listCount: "2", closed: true }),
                null,
                NOW,
            ),
        ).toBe("closed");
    });

    it("er påmeldt på et gratis arrangement", () => {
        expect(deriveRegistrationState(event(), registration(), NOW)).toBe(
            "joined",
        );
    });

    it("venter på betaling når plassen ikke er betalt", () => {
        expect(
            deriveRegistrationState(
                event({ isPaidEvent: true }),
                registration(),
                NOW,
            ),
        ).toBe("awaiting-payment");
    });

    it("er påmeldt når den betalte plassen er gjort opp", () => {
        expect(
            deriveRegistrationState(
                event({ isPaidEvent: true }),
                registration({ hasPaidOrder: true }),
                NOW,
            ),
        ).toBe("joined");
    });

    it("viser oppmøtt som påmeldt, ikke som ubetalt", () => {
        expect(
            deriveRegistrationState(
                event({ isPaidEvent: true }),
                registration({ status: "attended" }),
                NOW,
            ),
        ).toBe("joined");
    });

    it("er på venteliste", () => {
        expect(
            deriveRegistrationState(
                event(),
                registration({ status: "waitlisted" }),
                NOW,
            ),
        ).toBe("on-waitlist");
    });

    it("behandler en påmelding som ikke er avgjort", () => {
        expect(
            deriveRegistrationState(
                event({ isPaidEvent: true }),
                registration({ status: "pending" }),
                NOW,
            ),
        ).toBe("processing");
    });

    // Tidligere falt «cancelled» ned i vinduet og ga «open» — altså en
    // påmeldingsknapp. Photon svarer 409 «already registered» så lenge raden
    // ligger der, så knappen kunne aldri lykkes.
    it("holder en kansellert påmelding som avbrutt", () => {
        expect(
            deriveRegistrationState(
                event(),
                registration({ status: "cancelled" }),
                NOW,
            ),
        ).toBe("cancelled");
    });

    it("holder en kansellert påmelding avbrutt også på betalte arrangementer", () => {
        expect(
            deriveRegistrationState(
                event({ isPaidEvent: true }),
                registration({ status: "cancelled", hasPaidOrder: false }),
                NOW,
            ),
        ).toBe("cancelled");
    });
});

describe("formatCountdown", () => {
    it("teller ned i minutter og sekunder", () => {
        expect(formatCountdown(new Date(NOW.getTime() + 572_000).toISOString(), NOW)).toBe(
            "9:32",
        );
    });

    it("polstrer sekundene", () => {
        expect(formatCountdown(new Date(NOW.getTime() + 14_000).toISOString(), NOW)).toBe(
            "0:14",
        );
    });

    it("runder opp, så en frist som løper aldri viser 0:00", () => {
        expect(formatCountdown(new Date(NOW.getTime() + 200).toISOString(), NOW)).toBe(
            "0:01",
        );
    });

    it("gir null når fristen er passert", () => {
        expect(formatCountdown(past(1), NOW)).toBeNull();
    });

    it("går over til grov tekst over en time", () => {
        expect(formatCountdown(future(3), NOW)).toBe("3 timer");
    });
});

describe("formatTimeUntil", () => {
    it("bruker dager når det er langt fram", () => {
        expect(formatTimeUntil(future(72), NOW)).toBe("3 dager");
    });

    it("bruker entall for én time", () => {
        expect(formatTimeUntil(future(1), NOW)).toBe("en time");
    });

    it("dropper tomme ledd og viser bare sekunder", () => {
        expect(
            formatTimeUntil(new Date(NOW.getTime() + 41_000).toISOString(), NOW),
        ).toBe("41 sekunder");
    });
});

describe("registrationErrorMessage", () => {
    it("oversetter manglende regelgodkjenning", () => {
        expect(
            registrationErrorMessage(new Error("You must accept the event rules")),
        ).toContain("godkjenne arrangementsreglene");
    });

    it("forklarer at arrangementet er forbeholdt en prioritert gruppe", () => {
        expect(
            registrationErrorMessage(new Error("not in priority pool")),
        ).toContain("prioritert gruppe");
    });

    it("plukker ut instituttet fra meldingen", () => {
        expect(
            registrationErrorMessage(
                new Error("Event is only open to students at IDI"),
            ),
        ).toBe("Dette arrangementet er kun for studenter ved IDI.");
    });

    it("faller tilbake på API-meldingen når den er ukjent", () => {
        expect(registrationErrorMessage(new Error("Noe helt annet"))).toBe(
            "Noe helt annet",
        );
    });
});
