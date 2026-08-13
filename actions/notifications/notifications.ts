import { apiJson } from "@/lib/api/client";
import { PhotonNotification, toNotification } from "@/actions/photon";
import type { Notification } from "@/actions/types";

export const NOTIFICATIONS_PAGE_SIZE = 25;

type PhotonNotificationList = {
    totalCount: number;
    pages: number;
    nextPage: number | null;
    items: PhotonNotification[];
};

export type NotificationPage = {
    items: Notification[];
    nextPage: number | null;
    totalCount: number;
};

/**
 * Én side med varsler for den innloggede brukeren, nyeste først.
 *
 * `isRead` filtrerer på lest/ulest når den er satt, og tar med begge når den
 * er utelatt.
 */
export async function fetchNotifications(
    page: number,
    pageSize: number = NOTIFICATIONS_PAGE_SIZE,
    isRead?: boolean,
): Promise<NotificationPage> {
    const query = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    });
    if (isRead !== undefined) query.set("isRead", String(isRead));

    const data = await apiJson<PhotonNotificationList>(`/notification?${query}`);

    return {
        items: data.items.map(toNotification),
        // `nextPage` peker på en side som ikke finnes når den siste er full
        // helt på grensen — `page` er nullbasert, mens `pages` er et antall.
        // En kort side betyr at vi er ferdige, ellers ville lista hentet en
        // tom side til på bunnen.
        nextPage: data.items.length < pageSize ? null : data.nextPage,
        totalCount: data.totalCount,
    };
}

/**
 * Antall uleste varsler.
 *
 * Henter én rad og leser `totalCount` — Photon teller med samme filter, så
 * bjella slipper å laste ned varslene bare for å telle dem.
 */
export async function fetchUnreadNotificationCount(): Promise<number> {
    const data = await apiJson<PhotonNotificationList>(
        "/notification?page=0&pageSize=1&isRead=false",
    );
    return data.totalCount;
}

/** Markerer ett varsel som lest. */
export async function markNotificationRead(id: string): Promise<void> {
    await apiJson(`/notification/${id}/read`, {
        method: "PATCH",
        body: JSON.stringify({ isRead: true }),
    });
}
