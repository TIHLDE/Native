import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import { ISSUER } from "@/lib/auth/photon";
import { Event, Permissions, Membership, User } from "@/actions/types";
import { PhotonGroup, PhotonUser, toMembership, toUser } from "@/actions/photon";

type PhotonSession = {
    user: PhotonUser;
    permissions: string[];
    groups: { slug: string; name: string; type: string; logoUrl: string | null; role: string }[];
};

/**
 * Sesjonen dekker det Lepton delte på tre kall: /users/me/,
 * /users/me/permissions/ og /users/me/memberships/.
 */
async function session(): Promise<PhotonSession> {
    return apiJson<PhotonSession>(`${ISSUER}/get-session`);
}

export default async function me(): Promise<User> {
    const data = await session();
    return toUser(data.user);
}

/**
 * Photons rettigheter er navngitte strenger med scope, ikke Leptons tabell
 * over Django-modeller med read/write per modell.
 *
 * Appen leser bare `event.write`, så oversettelsen dekker det den faktisk
 * bruker framfor å gjenskape en tabell ingen spør etter. Lesing er åpen for
 * innloggede i Photon, så `read` er sann når sesjonen finnes.
 */
export async function myPermissions(): Promise<Permissions> {
    const data = await session();
    const has = (...needles: string[]) =>
        needles.some((needle) => data.permissions.includes(needle));

    return {
        event: {
            read: true,
            write: has("events:manage", "events:create", "events:update"),
        },
        fine: {
            read: true,
            write: has("fines:manage", "fines:create"),
        },
    } as unknown as Permissions;
}

export function usePermissions() {
    return useQuery({
        queryKey: ["permissions"],
        queryFn: myPermissions,
    });
}

type MyRegistration = {
    eventId: string;
    slug: string;
    title: string;
    startTime: string;
    status: string;
};

type MyRegistrations = { events: MyRegistration[]; totalCount: number };

/**
 * Photon har ingen filtrering på utløpte arrangementer, så skillet mellom
 * kommende og tidligere gjøres her på starttidspunktet.
 */
async function myRegistrations(): Promise<MyRegistration[]> {
    const data = await apiJson<MyRegistrations>("/event/my-registrations?pageSize=100");
    return data.events;
}

const asEvent = (registration: MyRegistration): Event =>
    ({
        id: registration.eventId,
        title: registration.title,
        start_date: registration.startTime,
        end_date: registration.startTime,
        paid_information: { price: "" },
        limit: 0,
        list_count: "0",
        waiting_list_count: "0",
        sign_off_deadline: "",
        end_registration_at: "",
        start_registration_at: "",
    }) as unknown as Event;

export async function myEvents(): Promise<{ results: Event[] }> {
    const now = Date.now();
    const events = await myRegistrations();
    return {
        results: events
            .filter((event) => new Date(event.startTime).getTime() >= now)
            .map(asEvent),
    };
}

export async function myPreviousEvents(): Promise<{ results: Event[] }> {
    const now = Date.now();
    const events = await myRegistrations();
    return {
        results: events
            .filter((event) => new Date(event.startTime).getTime() < now)
            .map(asEvent),
    };
}

export async function myMemberships(): Promise<Membership["group"][]> {
    const groups = await apiJson<PhotonGroup[]>("/groups/mine");
    return groups.filter((group) => group.membership).map((group) => toMembership(group).group);
}

/**
 * Profilfeltene ligger på brukerinnstillinger i Photon, ikke på brukeren.
 */
export async function updateUserProfile(updates: {
    bio?: string;
    github?: string;
    linkedin?: string;
    allergies?: string;
}): Promise<User> {
    await apiJson("/user/me/settings", {
        method: "PATCH",
        body: JSON.stringify(updates),
    });
    return me();
}
