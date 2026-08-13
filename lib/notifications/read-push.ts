import {
    fetchNotifications,
    markNotificationRead,
} from "@/actions/notifications/notifications";

/** Hvor mange uleste vi leter gjennom etter det som ble trykket på. */
const SEARCH_PAGE_SIZE = 50;

/**
 * Markerer varselet bak et trykket push-varsel som lest.
 *
 * Photon legger `notificationId` i nyttelasten, og da er det bare å markere
 * den raden. Varsler som lå i køen før det endepunktet ble utplassert bærer
 * ingen id, og for dem letes det i de uleste etter samme tittel og tekst. Er
 * det flere like, vinner det nyeste — lista kommer sortert med det først.
 *
 * Gir `true` når noe faktisk ble markert, slik at den som kaller vet om
 * antallet uleste er endret.
 */
export async function markPushNotificationRead(content: {
    notificationId?: string | null;
    title?: string | null;
    body?: string | null;
    link?: string | null;
}): Promise<boolean> {
    if (content.notificationId) {
        try {
            await markNotificationRead(content.notificationId);
            return true;
        } catch {
            return false;
        }
    }

    if (!content.title) return false;

    try {
        const unread = await fetchNotifications(0, SEARCH_PAGE_SIZE, false);

        const match = unread.items.find(
            (notification) =>
                notification.title === content.title &&
                notification.description === (content.body ?? "") &&
                // Lenken sammenlignes bare når push-varselet har en. Eldre
                // varsler i køen kan ha blitt sendt uten.
                (!content.link || notification.link === content.link),
        );

        if (!match) return false;

        await markNotificationRead(match.id);
        return true;
    } catch {
        // Et varsel som ikke rekker å bli markert som lest er ikke verdt å
        // avbryte navigasjonen for — brukeren er på vei inn i appen.
        return false;
    }
}
