import type { QueryClient } from "@tanstack/react-query";

/**
 * Nøklene varsellista og bjella deler.
 *
 * `unreadCount` ligger med vilje under `list` sin nøkkel: å invalidere
 * `["notifications"]` treffer da begge, som er riktig hver gang noe leses.
 */
export const notificationKeys = {
    list: ["notifications"] as const,
    unreadCount: ["notifications", "unread"] as const,
};

/**
 * Teller ned antallet uleste uten å spørre serveren.
 *
 * Brukes mens varsellista er åpen: der markeres varsler som lest ett og ett
 * etter hvert som de kommer til syne, og en invalidering per varsel ville
 * blitt et kall til Photon per rad brukeren scroller forbi.
 */
export function decrementUnreadCount(queryClient: QueryClient): void {
    queryClient.setQueryData<number>(notificationKeys.unreadCount, (count) =>
        Math.max(0, (count ?? 1) - 1),
    );
}
