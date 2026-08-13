/**
 * Et varsel slik appen viser det.
 *
 * Dette er den eneste typen som ikke er arvet fra Leptons snake_case: varsler
 * fantes ikke i appen før Photon, så navnene er Photons egne.
 */
export type Notification = {
    id: string;
    title: string;
    description: string;
    /** Nettsidelenke varselet peker på, eller null. Oversettes av `toAppRoute`. */
    link: string | null;
    isRead: boolean;
    /** ISO 8601. */
    createdAt: string;
};
