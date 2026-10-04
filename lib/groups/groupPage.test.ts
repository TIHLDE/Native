import { describe, it, expect } from "@jest/globals";
import type { GroupMember } from "@/actions/types";
import {
    STATUS_OPTIONS,
    groupTabs,
    groupTypeLabel,
    perMember,
    sortMembers,
    statusLabel,
} from "./groupPage";

const member = (
    firstName: string,
    lastName: string,
    membershipType: GroupMember["membershipType"] = "MEMBER"
): GroupMember => ({
    membershipType,
    joinedAt: "",
    user: {
        id: firstName,
        userId: firstName.toLowerCase(),
        firstName,
        lastName,
        email: "",
        gender: 0,
    },
});

describe("groupTabs", () => {
    it("viser bare Om og Medlemmer uten bøter", () => {
        expect(groupTabs(false).map((tab) => tab.key)).toEqual(["info", "members"]);
    });

    it("legger til Bøter og Lovverk når bøter er aktivert", () => {
        expect(groupTabs(true).map((tab) => tab.key)).toEqual([
            "info",
            "members",
            "fines",
            "laws",
        ]);
    });
});

describe("sortMembers", () => {
    it("setter lederne øverst og resten alfabetisk på norsk", () => {
        const sorted = sortMembers([
            member("Åse", "Berg"),
            member("Ola", "Nordmann"),
            member("Kari", "Leder", "LEADER"),
            member("Øystein", "Dahl"),
            member("Anne", "Lund"),
        ]);
        expect(sorted.map((m) => m.user.firstName)).toEqual([
            "Kari",
            "Anne",
            "Ola",
            "Øystein",
            "Åse",
        ]);
    });

    it("endrer ikke lista den får inn", () => {
        const members = [member("B", "B"), member("A", "A")];
        sortMembers(members);
        expect(members[0].user.firstName).toBe("B");
    });
});

describe("perMember", () => {
    it("deler på antall medlemmer med én desimal", () => {
        expect(perMember(7, 4)).toBe("1.8");
    });

    it("gir 0.0 for en gruppe uten medlemmer", () => {
        expect(perMember(5, 0)).toBe("0.0");
    });
});

describe("statusLabel", () => {
    const alle = STATUS_OPTIONS[0];

    it("kaller det ufiltrerte valget «Aktive bøter» per medlem", () => {
        expect(statusLabel(alle, "per-medlem")).toBe("Aktive bøter");
        expect(statusLabel(alle, "alle")).toBe("Alle bøter");
    });
});

describe("groupTypeLabel", () => {
    it("slår opp uavhengig av store og små bokstaver", () => {
        expect(groupTypeLabel("subgroup")).toBe("Undergruppe");
        expect(groupTypeLabel("SPORTSTEAM")).toBe("Idrettslag");
    });

    it("faller tilbake til typen selv", () => {
        expect(groupTypeLabel("ukjent")).toBe("Ukjent");
    });
});
