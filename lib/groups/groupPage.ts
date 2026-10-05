import type { FineStatus, GroupMember } from "@/actions/types";

export type GroupTabKey = "info" | "members" | "fines" | "laws";

/**
 * Fanene på gruppesida, i rekkefølge.
 *
 * Fanene identifiseres med nøkkel, ikke posisjon: settet endrer seg med
 * `finesActivated`, og en indeks som pekte på «Bøter» i én gruppe ville pekt
 * på noe annet — eller ingenting — i neste.
 */
export function groupTabs(
    finesActivated: boolean
): { key: GroupTabKey; label: string }[] {
    const tabs: { key: GroupTabKey; label: string }[] = [
        { key: "info", label: "Om" },
        { key: "members", label: "Medlemmer" },
    ];
    if (finesActivated) {
        tabs.push({ key: "fines", label: "Bøter" }, { key: "laws", label: "Lovverk" });
    }
    return tabs;
}

const fullName = (member: GroupMember) =>
    `${member.user.firstName} ${member.user.lastName}`.trim();

/** Lederne øverst, deretter alfabetisk på norsk (så Æ, Ø og Å havner sist). */
export function sortMembers(members: GroupMember[]): GroupMember[] {
    return [...members].sort((a, b) => {
        if (a.membershipType !== b.membershipType) {
            return a.membershipType === "LEADER" ? -1 : 1;
        }
        return fullName(a).localeCompare(fullName(b), "no");
    });
}

/**
 * Snitt per medlem med én desimal, som på nett. En gruppe uten medlemmer gir
 * «0.0» framfor «NaN».
 */
export function perMember(value: number, memberCount: number): string {
    if (memberCount <= 0) return "0.0";
    return (value / memberCount).toFixed(1);
}

export type FineGrouping = "alle" | "per-medlem";
export type FineStatusFilter = FineStatus | "alle";

/**
 * Ett statusfilter, ikke to boolske — samme liste som Kvark. Photon lagrer én
 * status per bot, så kombinasjoner som «betalt, men ikke godkjent» finnes ikke.
 */
export const STATUS_OPTIONS: { value: FineStatusFilter; label: string }[] = [
    { value: "alle", label: "Alle bøter" },
    { value: "pending", label: "Ikke godkjent" },
    { value: "approved", label: "Godkjent, ikke betalt" },
    { value: "paid", label: "Betalt" },
    { value: "rejected", label: "Avvist" },
];

/**
 * «Per medlem» summerer bare de aktive bøtene — betalte og avviste er gjort
 * opp — så det ufiltrerte valget heter noe annet der enn i bøtelista, hvor det
 * faktisk viser alt.
 */
export function statusLabel(
    option: { value: FineStatusFilter; label: string },
    grouping: FineGrouping
): string {
    if (option.value === "alle" && grouping === "per-medlem") {
        return "Aktive bøter";
    }
    return option.label;
}

const GROUP_TYPE_LABELS: Record<string, string> = {
    SUBGROUP: "Undergruppe",
    COMMITTEE: "Komité",
    BOARD: "Styre",
    INTERESTGROUP: "Interessegruppe",
    SPORTSTEAM: "Idrettslag",
    STUDYYEAR: "Klassetrinn",
    STUDY: "Studie",
    TIHLDE: "TIHLDE",
    PRIVATE: "Privat",
};

/**
 * Norsk navn på en gruppetype. Samme tabell som `groupTypeLabel` i Kvark.
 *
 * Oppslaget er uavhengig av store og små bokstaver: typen er fritekst i
 * Photon, og migrerte grupper har typer som ikke står i enumen.
 */
export function groupTypeLabel(type: string): string {
    if (!type) return "";
    return (
        GROUP_TYPE_LABELS[type.toUpperCase()] ??
        type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
    );
}
