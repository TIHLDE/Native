import { describe, it, expect } from "@jest/globals";
import type { Group, GroupListItem, GroupMember, Membership } from "@/actions/types";
import {
    STATUS_OPTIONS,
    finesTabsVisible,
    groupSections,
    groupTabs,
    groupTypeLabel,
    isAutomaticGroupType,
    memberFinesInitialParam,
    memberFinesNextParam,
    remainingFines,
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

    it("legger til Bøter når bøter er aktivert", () => {
        expect(groupTabs(true).map((tab) => tab.key)).toEqual([
            "info",
            "members",
            "fines",
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

describe("STATUS_OPTIONS", () => {
    it("tilbyr ikke «Avvist», som ingenting kan sette", () => {
        expect(STATUS_OPTIONS.map((option) => option.value)).toEqual([
            "alle",
            "pending",
            "approved",
            "paid",
        ]);
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

describe("isAutomaticGroupType", () => {
    it("kjenner igjen de automatiske gruppene uavhengig av store og små bokstaver", () => {
        expect(isAutomaticGroupType("TIHLDE")).toBe(true);
        expect(isAutomaticGroupType("study")).toBe(true);
        expect(isAutomaticGroupType("STUDYYEAR")).toBe(true);
    });

    it("slipper gjennom ekte grupper og grupper uten type", () => {
        expect(isAutomaticGroupType("PRIVATE")).toBe(false);
        expect(isAutomaticGroupType("COMMITTEE")).toBe(false);
        expect(isAutomaticGroupType("")).toBe(false);
        expect(isAutomaticGroupType(null)).toBe(false);
    });
});

const group = (
    slug: string,
    type: string,
    extra: Partial<GroupListItem> = {}
): GroupListItem => ({
    slug,
    name: slug,
    type,
    finesActivated: false,
    memberCount: 3,
    ...extra,
});

const membershipOf = (
    g: Group,
    membershipType: Membership["membershipType"] = "MEMBER"
): Membership => ({
    createdAt: "",
    expirationDate: null,
    group: g,
    membershipType,
    user: {
        userId: "",
        firstName: "",
        lastName: "",
        email: "",
        gender: 0,
        study: { group: { name: "", slug: "", type: "" } },
        studyyear: { group: { name: "", slug: "", type: "" } },
        classYear: null,
        unansweredEvaluationsCount: 0,
    },
});

describe("groupSections", () => {
    it("ordner seksjonene som på nett og dropper tomme", () => {
        const sections = groupSections(
            [
                group("index", "committee"),
                group("hs", "BOARD"),
                group("drift", "subgroup"),
                group("ny", "noeNytt"),
            ],
            []
        );
        expect(sections.map((s) => [s.key, s.title])).toEqual([
            ["board", "Hovedorgan"],
            ["subgroup", "Undergrupper"],
            ["committee", "Komitéer"],
            ["other", "Andre"],
        ]);
    });

    it("holder private og automatiske grupper ute av typeseksjonene", () => {
        const sections = groupSections(
            [
                group("hemmelig", "private"),
                group("tihlde", "tihlde"),
                group("dataing", "study"),
                group("2024", "studyyear"),
                group("index", "committee"),
            ],
            []
        );
        expect(sections.flatMap((s) => s.rows.map((r) => r.group.slug))).toEqual([
            "index",
        ]);
    });

    it("viser egne private grupper under Mine grupper, uten automatiske", () => {
        const privat = group("hemmelig", "private");
        const sections = groupSections(
            [privat],
            [membershipOf(privat), membershipOf(group("tihlde", "TIHLDE"))]
        );
        expect(sections).toHaveLength(1);
        expect(sections[0].key).toBe("mine");
        expect(sections[0].rows.map((r) => r.group.slug)).toEqual(["hemmelig"]);
    });

    it("setter rolle på egne grupper i typeseksjonene", () => {
        const index = group("index", "committee");
        const sections = groupSections(
            [index, group("annen", "committee")],
            [membershipOf(index, "LEADER")]
        );
        const committee = sections.find((s) => s.key === "committee")!;
        expect(committee.rows.map((r) => [r.group.slug, r.role])).toEqual([
            ["annen", undefined],
            ["index", "LEADER"],
        ]);
    });

    it("sorterer på norsk", () => {
        const sections = groupSections(
            [
                group("Åpen", "committee", { name: "Åpen" }),
                group("Ørn", "committee", { name: "Ørn" }),
                group("Berg", "committee", { name: "Berg" }),
            ],
            []
        );
        expect(sections[0].rows.map((r) => r.group.name)).toEqual([
            "Berg",
            "Ørn",
            "Åpen",
        ]);
    });

    it("henter medlemstallet til Mine grupper fra lista når gruppa står der", () => {
        const index = group("index", "committee", { memberCount: 12 });
        const arkivert = group("gammel", "committee");
        const sections = groupSections(
            [index],
            [membershipOf(index), membershipOf(arkivert)]
        );
        const mine = sections[0];
        expect(mine.rows.map((r) => [r.group.slug, r.memberCount])).toEqual([
            ["gammel", undefined],
            ["index", 12],
        ]);
    });

    it("gir bare typeseksjonene uten medlemskap", () => {
        const sections = groupSections([group("hs", "board")], []);
        expect(sections.map((s) => s.key)).toEqual(["board"]);
    });
});

describe("finesTabsVisible", () => {
    const withFines = group("index", "committee", { finesActivated: true });

    it("lar detaljsvaret avgjøre når det er kommet", () => {
        expect(
            finesTabsVisible({ ...withFines, viewerCanUseFines: false }, withFines)
        ).toBe(false);
        expect(
            finesTabsVisible({ ...withFines, viewerCanUseFines: true }, undefined)
        ).toBe(true);
    });

    it("faller tilbake på medlemskapet før detaljsvaret", () => {
        expect(finesTabsVisible(undefined, withFines)).toBe(true);
        expect(finesTabsVisible(undefined, group("x", "committee"))).toBe(false);
    });

    it("skjuler fanene for en som ikke er med før detaljsvaret", () => {
        expect(finesTabsVisible(undefined, undefined)).toBe(false);
    });

    it("blaffer for et studiegruppemedlem som ikke lenger er innskrevet", () => {
        const study = group("dataing", "study", { finesActivated: true });
        expect(finesTabsVisible(undefined, study)).toBe(true);
        expect(
            finesTabsVisible({ ...study, viewerCanUseFines: false }, study)
        ).toBe(false);
    });
});

describe("bøtene til ett medlem", () => {
    it("starter Aktive på pending, og en status på seg selv", () => {
        expect(memberFinesInitialParam(undefined)).toEqual({
            status: "pending",
            page: 0,
        });
        expect(memberFinesInitialParam("paid")).toEqual({
            status: "paid",
            page: 0,
        });
    });

    it("blar videre i samme status så lenge det er flere sider", () => {
        expect(
            memberFinesNextParam(undefined, { next: 1 }, { status: "pending", page: 0 })
        ).toEqual({ status: "pending", page: 1 });
        expect(
            memberFinesNextParam("paid", { next: 2 }, { status: "paid", page: 1 })
        ).toEqual({ status: "paid", page: 2 });
    });

    it("går fra pending til approved i Aktive", () => {
        expect(
            memberFinesNextParam(undefined, { next: null }, { status: "pending", page: 3 })
        ).toEqual({ status: "approved", page: 0 });
    });

    it("stopper etter approved i Aktive og etter siste side med én status", () => {
        expect(
            memberFinesNextParam(undefined, { next: null }, { status: "approved", page: 0 })
        ).toBeUndefined();
        expect(
            memberFinesNextParam("pending", { next: null }, { status: "pending", page: 0 })
        ).toBeUndefined();
    });

    it("teller gjenstående hendelser, aldri under 0", () => {
        expect(remainingFines(17, 10)).toBe(7);
        expect(remainingFines(10, 12)).toBe(0);
    });
});
