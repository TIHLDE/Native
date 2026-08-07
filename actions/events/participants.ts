import { apiFetch, apiJson } from "@/lib/api/client";
import { Registration } from "../types";
import { PhotonRegisteredUser, toRegistration } from "@/actions/photon";

type PhotonRegistrations = {
    registeredUsers: PhotonRegisteredUser[];
    totalCount: number;
    nextPage: number | null;
};

const PAGE_SIZE = 25;

/**
 * Deltakerlista. Photon paginerer med side og sidestørrelse, og gir `nextPage`
 * som et tall — skjermene forventer `next` som en streng eller null, siden
 * Lepton ga en URL der.
 *
 * Sidetallene er nullbaserte: `page=0` er første side. Ba man om side 1 fikk
 * man side to, og de første 25 deltakerne fantes ikke.
 */
export async function eventParticipants(
    eventId: string,
    pageParam: number,
    search?: string
): Promise<{ results: Registration[]; next: string | null }> {
    const params = new URLSearchParams({
        page: String(pageParam),
        pageSize: String(PAGE_SIZE),
    });
    if (search) params.set("search", search);

    const data = await apiJson<PhotonRegistrations>(
        `/event/${encodeURIComponent(String(eventId))}/registration?${params}`
    );

    return {
        results: data.registeredUsers.map(toRegistration),
        next: data.nextPage !== null ? String(data.nextPage) : null,
    };
}

/**
 * Photon skiller ikke på offentlig og privat deltakerliste — synligheten
 * avgjøres av rettighetene til den som spør. Beholdt som eget navn siden
 * skjermene kaller den, men den treffer samme rute.
 */
export async function publicEventParticipants(
    eventId: string,
    pageParam: number
): Promise<{ results: Registration[]; next: string | null }> {
    return eventParticipants(eventId, pageParam);
}

/**
 * Registrerer oppmøte. Lepton tok en boolean på hele påmeldingen; Photon har en
 * egen oppmøterute per bruker.
 */
export async function updateEventParticipation(
    eventId: string,
    user_id: string,
    value: boolean
): Promise<boolean> {
    const response = await apiFetch(
        `/event/${encodeURIComponent(String(eventId))}/registration/${encodeURIComponent(user_id)}/attendance`,
        {
            method: "PATCH",
            body: JSON.stringify({ attended: value }),
        }
    );

    if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? `Kunne ikke oppdatere oppmøte (${response.status})`);
    }

    return value;
}

export async function isEventParticipant(eventId: string, userId: string): Promise<boolean> {
    const data = await apiJson<PhotonRegistrations>(
        `/event/${encodeURIComponent(String(eventId))}/registration?pageSize=500`
    ).catch(() => null);

    return Boolean(data?.registeredUsers.some((registered) => registered.id === userId));
}
