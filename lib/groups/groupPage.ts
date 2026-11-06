import type {
    FineStatus,
    Group,
    GroupListItem,
    GroupMember,
    Membership,
} from "@/actions/types";

export type GroupTabKey = "info" | "members" | "fines";

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
        tabs.push({ key: "fines", label: "Bøter" });
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

export type FineGrouping = "alle" | "per-medlem";
export type FineStatusFilter = FineStatus | "alle";

/**
 * Ett statusfilter, ikke to boolske — samme liste som Kvark. Photon lagrer én
 * status per bot, så kombinasjoner som «betalt, men ikke godkjent» finnes ikke.
 *
 * `rejected` er utelatt: statusen finnes i Photon, men ingenting setter den —
 * Kvark sletter bøter i stedet for å avvise dem. Et valg som alltid gir en tom
 * liste hører ikke hjemme i filteret. `FineCard` viser fortsatt «Avvist» om
 * en slik bot skulle dukke opp.
 */
export const STATUS_OPTIONS: { value: FineStatusFilter; label: string }[] = [
    { value: "alle", label: "Alle bøter" },
    { value: "pending", label: "Ikke godkjent" },
    { value: "approved", label: "Godkjent, ikke betalt" },
    { value: "paid", label: "Betalt" },
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

const AUTOMATIC_GROUP_TYPES = ["tihlde", "study", "studyyear"];

/**
 * Medlemskap alle får automatisk, og som ikke er grupper i den forstand folk
 * mener «gruppe»: selve TIHLDE, studieprogrammet og kullet. Ingen har meldt seg
 * inn i dem, de har ingen aktivitet, og de fylte lista med tre rader støy.
 *
 * Filteret går på type og ikke på navn — en skjult interessegruppe kan hete det
 * samme som studieprogrammet sitt, og den er reell og skal vises for dem som er
 * med. `private` og `interestgroup` slipper derfor gjennom, og det gjør også en
 * gruppe uten type.
 */
export function isAutomaticGroupType(type: string | null | undefined): boolean {
    return type ? AUTOMATIC_GROUP_TYPES.includes(type.toLowerCase()) : false;
}

/**
 * Om Bøter-fanen skal vises på gruppesida.
 *
 * Photon avgjør det for innloggeren med `viewerCanUseFines` i
 * `GET /groups/:slug`. `finesActivated` alene holder ikke: en som ikke er med
 * får 403 på både bøtene og lovverket, mens botsjefen har tilgang uten å
 * være medlem.
 *
 * Før detaljsvaret er kommet faller vi tilbake på medlemskapet, så fanene står
 * klare med en gang for medlemmer, og et botvarsel kan åpne rett på Bøter. Det
 * gir ett kjent blaff: et medlem av en studiegruppe som ikke lenger er
 * innskrevet ser fanene til detaljsvaret sier nei. Studiegrupper står ikke i
 * lista, så det skjer bare via et varsel.
 *
 * Root har tilgang i Photon, men ikke i flagget, og appen sjekker ikke root —
 * så root ser ikke fanene i grupper de ikke er med i.
 */
export function finesTabsVisible(
    detail: Group | undefined,
    membershipGroup: Group | undefined
): boolean {
    if (detail) return detail.viewerCanUseFines ?? false;
    return membershipGroup?.finesActivated ?? false;
}

export type GroupRow = {
    group: Group;
    /** Mangler for arkiverte grupper, som `GET /groups` ikke lister. */
    memberCount?: number;
    /** Satt når brukeren er med i gruppa. */
    role?: Membership["membershipType"];
};

export type GroupSectionKey =
    | "mine"
    | "board"
    | "subgroup"
    | "committee"
    | "interestgroup"
    | "sportsteam"
    | "other";

export type GroupSection = {
    key: GroupSectionKey;
    title: string;
    rows: GroupRow[];
};

const TYPE_SECTIONS: { key: Exclude<GroupSectionKey, "mine">; title: string }[] = [
    { key: "board", title: "Hovedorgan" },
    { key: "subgroup", title: "Undergrupper" },
    { key: "committee", title: "Komitéer" },
    { key: "interestgroup", title: "Interessegrupper" },
    { key: "sportsteam", title: "Idrettslag" },
    { key: "other", title: "Andre" },
];

const byName = (a: GroupRow, b: GroupRow) =>
    a.group.name.localeCompare(b.group.name, "no");

/**
 * Grupper-fanen: brukerens egne grupper først, så alle grupper etter type.
 *
 * Private grupper listes av Photon til alle, men gruppesida deres svarer 403
 * for dem som ikke er med, så de holdes ute av typeseksjonene og vises bare
 * under «Mine grupper». Automatiske grupper (TIHLDE, studie, kull) vises ikke
 * noe sted. En ukjent type havner under «Andre» framfor å forsvinne.
 */
export function groupSections(
    groups: GroupListItem[],
    memberships: Membership[]
): GroupSection[] {
    const roleBySlug = new Map(
        memberships.map((item) => [item.group.slug, item.membershipType])
    );
    const countBySlug = new Map(
        groups.map((group) => [group.slug, group.memberCount])
    );

    const mine: GroupRow[] = memberships
        .filter((item) => !isAutomaticGroupType(item.group.type))
        .map((item) => ({
            group: item.group,
            memberCount: countBySlug.get(item.group.slug),
            role: item.membershipType,
        }))
        .sort(byName);

    const byType = new Map<GroupSectionKey, GroupRow[]>();
    for (const group of groups) {
        const type = (group.type ?? "").toLowerCase();
        if (isAutomaticGroupType(type) || type === "private") continue;
        const key: GroupSectionKey = TYPE_SECTIONS.some(
            (section) => section.key === type
        )
            ? (type as GroupSectionKey)
            : "other";
        const rows = byType.get(key) ?? [];
        rows.push({
            group,
            memberCount: group.memberCount,
            role: roleBySlug.get(group.slug),
        });
        byType.set(key, rows);
    }

    const sections: GroupSection[] = [
        { key: "mine", title: "Mine grupper", rows: mine },
        ...TYPE_SECTIONS.map((section) => ({
            ...section,
            rows: (byType.get(section.key) ?? []).sort(byName),
        })),
    ];
    return sections.filter((section) => section.rows.length > 0);
}
