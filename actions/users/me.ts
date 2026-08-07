import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import { ISSUER } from "@/lib/auth/photon";
import { Event, Permissions, Membership, User } from "@/actions/types";
import { PhotonGroup, toMembership, toUser } from "@/actions/photon";

/**
 * Standardkravene fra OIDC-userinfo, pluss brukernavnet og rettighetene Photon
 * legger på.
 */
type PhotonUserInfo = {
    sub: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    preferred_username?: string | null;
    permissions?: string[];
};

/**
 * Hvem tokenet tilhører, og hva det gir lov til.
 *
 * Access-tokenet er ikke alltid en JWT — plugin-en signerer bare når kallet har
 * en audience, og gir ellers et opakt token uten krav i seg. Userinfo svarer
 * likt uansett, så alt leses derfra.
 */
function userinfo(): Promise<PhotonUserInfo> {
    return apiJson<PhotonUserInfo>(`${ISSUER}/oauth2/userinfo`);
}

/** Delen av `/user/:id` appen viser. */
type PhotonUserProfile = {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
    studyProgram: string | null;
    studyStartYear: number | null;
};

/**
 * Brukeren bak tokenet.
 *
 * Better Auth sin egen `/get-session` leser sesjonscookien, og en OAuth-klient
 * har aldri noen cookie — den svarer `null` uansett hvor gyldig tokenet er.
 * Identiteten hentes derfor fra OIDC-userinfo, og studieprogrammet fra Photons
 * egen profilrute. Begge tar bearer-tokenet.
 */
export default async function me(): Promise<User> {
    const info = await userinfo();
    const profile = await apiJson<PhotonUserProfile>(
        `/user/${encodeURIComponent(info.sub)}`,
    );

    return toUser({
        id: info.sub,
        // Profilruta er kilden der begge har feltet: den foretrekker den
        // opplastede avataren, mens userinfo alltid gir Feide-bildet.
        name: profile.name ?? info.name,
        username: profile.username ?? info.preferred_username,
        // E-posten er privat i profilruta, så den kan bare komme herfra.
        email: info.email,
        image: profile.image ?? info.picture,
        studyProgram: profile.studyProgram,
        studyStartYear: profile.studyStartYear,
    });
}

/**
 * Photons rettigheter er navngitte strenger med scope, ikke Leptons tabell
 * over Django-modeller med read/write per modell.
 *
 * Strengene kommer fra userinfo. En scopet rettighet ser ut som
 * `events:update@group:sosialen`; her holder det å vite at brukeren har den et
 * sted, siden API-et sjekker scopet på nytt når handlingen faktisk utføres.
 *
 * Appen leser bare `event.write` og `fine.write`, så oversettelsen dekker det
 * den faktisk bruker framfor å gjenskape en tabell ingen spør etter. Lesing er
 * åpen for innloggede i Photon, så `read` er sann når sesjonen finnes.
 */
export async function myPermissions(): Promise<Permissions> {
    const { permissions } = await userinfo();
    const granted = new Set(
        (permissions ?? []).map((raw) => raw.split("@")[0]),
    );
    const has = (...needles: string[]) =>
        needles.some((needle) => granted.has(needle));

    return {
        event: {
            read: true,
            // Det eneste `event.write` styrer i appen er «Registrer oppmøte»,
            // så innsjekksrettighetene teller like mye som redigering.
            write: has(
                "events:manage",
                "events:create",
                "events:update",
                "events:registrations:manage",
                "events:registrations:checkin",
            ),
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
