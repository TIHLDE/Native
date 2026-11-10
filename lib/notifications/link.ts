import { fetchEvent } from "@/actions/events/events";

/**
 * Oversetter lenken i et varsel til en rute i appen.
 *
 * Photon skriver lenkene for nettsiden, og ikke helt konsekvent: noen er
 * absolutte (`https://tihlde.org/arrangementer/...`), andre relative. Derfor
 * kuttes opprinnelsen bort før stien leses.
 *
 * Gir `null` for lenker appen ikke har en skjerm for. Da åpnes appen som
 * vanlig i stedet for å sende brukeren til en tilfeldig skjerm.
 */
export async function toAppRoute(
    link: string | null | undefined,
): Promise<string | null> {
    if (!link) return null;

    const path = stripOrigin(link);
    const [pathname, query] = path.split("?");
    const segments = pathname.split("/").filter(Boolean);

    if (segments[0] === "arrangementer" && segments[1]) {
        // Nettsiden ruter på slug, mens arrangementsskjermen sender id-en
        // videre til påmeldings- og deltakerkallene — og de slår bare opp på
        // id. Slugen byttes derfor til id-en her.
        const identifier = segments[1];
        const event = await fetchEvent(identifier).catch(() => null);
        if (!event) return null;

        return `/(modals)/arrangement/${event.id}`;
    }

    // Bøtelenken har hatt to former: `/grupper/<slug>?tab=boter` (de eldste
    // varslene, som fortsatt ligger lagret) og `/grupper/<slug>/boter` etter at
    // nettsiden gjorde fanene til egne ruter. Begge åpner gruppesida på
    // bøtefanen, der den som fikk boten kan se den — ikke flyten for å gi en.
    if (segments[0] === "grupper" && segments[1]) {
        const isFineLink =
            segments[2] === "boter" ||
            new URLSearchParams(query).get("tab") === "boter";

        if (isFineLink) {
            const slug = encodeURIComponent(decodeSegment(segments[1]));
            return `/(modals)/gruppe/${slug}?tab=fines`;
        }
    }

    return null;
}

// En absolutt lenke går gjennom `new URL`, som prosentkoder æøå i stien; en
// relativ lenke kommer rå. Dekodes først, så begge gir samme rute og sluggen
// ikke kodes to ganger. En ødelagt %-sekvens brukes som den står.
function decodeSegment(segment: string): string {
    try {
        return decodeURIComponent(segment);
    } catch {
        return segment;
    }
}

function stripOrigin(link: string): string {
    try {
        return new URL(link).pathname + new URL(link).search;
    } catch {
        // Relativ lenke — den er allerede en sti.
        return link.startsWith("/") ? link : `/${link}`;
    }
}
