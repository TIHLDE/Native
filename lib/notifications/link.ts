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

    // `/grupper/<slug>?tab=boter` er bøtelenken. Gruppesider ellers finnes
    // ikke i appen, så bare bøtefanen tas.
    if (
        segments[0] === "grupper" &&
        segments[1] &&
        new URLSearchParams(query).get("tab") === "boter"
    ) {
        return `/(modals)/boter/${segments[1]}`;
    }

    return null;
}

function stripOrigin(link: string): string {
    try {
        return new URL(link).pathname + new URL(link).search;
    } catch {
        // Relativ lenke — den er allerede en sti.
        return link.startsWith("/") ? link : `/${link}`;
    }
}
