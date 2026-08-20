import { apiFetch, apiJson } from "@/lib/api/client";
import { Registration } from "../types";
import { toRegistration } from "@/actions/photon";
import me from "../users/me";

type PhotonRegisteredUser = {
    id: string;
    name: string;
    email: string;
    image: string | null;
    status: string;
    waitlistPosition: number | null;
    attendedAt: string | null;
    registeredAt: string;
    payment: unknown | null;
};

type PhotonRegistrations = {
    registeredUsers: PhotonRegisteredUser[];
    totalCount: number;
    nextPage: number | null;
};

/**
 * Photon har ingen «hent min påmelding»-rute. Lista hentes i stedet og filtreres
 * på egen bruker — samme antall kall som før, siden Lepton-varianten også måtte
 * slå opp brukeren først.
 */
export async function iAmRegisteredToEvent(eventId: string): Promise<Registration | null> {
    const [user, data] = await Promise.all([
        me(),
        apiJson<PhotonRegistrations>(
            `/event/${encodeURIComponent(String(eventId))}/registration?pageSize=500`
        ).catch(() => null),
    ]);

    const mine = data?.registeredUsers.find(
        (registered) => registered.email === user.email
    );
    return mine ? toRegistration(mine) : null;
}

export async function registerToEvent(eventId: string): Promise<Registration> {
    // Photon krever en JSON-body her (`requestBody.required`), og `apiFetch`
    // setter Content-Type uansett — uten body prøvde serveren å parse tomt og
    // svarte «Malformed JSON in request body», så påmelding var umulig.
    //
    // `allowPhoto` utelates med vilje: da bruker Photon samtykket brukeren har
    // satt på kontoen sin, som er der det hører hjemme.
    const response = await apiFetch(
        `/event/${encodeURIComponent(String(eventId))}/registration`,
        { method: "POST", body: JSON.stringify({}) }
    );

    if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? `Påmelding feilet (${response.status})`);
    }

    return toRegistration((await response.json()) as PhotonRegisteredUser);
}

export async function unregisterFromEvent(eventId: string): Promise<string> {
    const response = await apiFetch(
        `/event/${encodeURIComponent(String(eventId))}/registration`,
        { method: "DELETE" }
    );

    if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? `Avmelding feilet (${response.status})`);
    }

    return "Du er meldt av arrangementet";
}
