import { apiFetch } from "@/lib/api/client";
import { Registration } from "../types";
import { PhotonRegisteredUser, toRegistration } from "@/actions/photon";

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
