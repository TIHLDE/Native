import { apiJson } from "@/lib/api/client";
import { FineLeaderboardEntry, FineStatus } from "@/actions/types";
import { PhotonFineUserList, toFineLeaderboardEntry } from "@/actions/photon";
import { PAGE_SIZE } from "./fines";

/**
 * Medlemmene i gruppa med summen av bøtene sine, høyest først.
 *
 * Photon sorterer allerede — ikke sorter på nytt her. Medlemmer uten bøter er
 * med, med 0, så lista er hele medlemslista og ikke bare de som har fått noe.
 *
 * Uten `status` teller Photon bare de aktive bøtene: de som venter på
 * godkjenning og de som er godkjent men ikke betalt. `"alle"` er det samme
 * valget sett fra filterraden, og sendes derfor ikke med.
 *
 * Svarer 404 når gruppa ikke har bøter aktivert, så kallet skal ikke gjøres for
 * slike grupper.
 */
export async function fetchFineLeaderboard(
    groupSlug: string,
    page: number = 0,
    status?: FineStatus | "alle"
): Promise<{
    results: FineLeaderboardEntry[];
    next: number | null;
    totalCount: number;
}> {
    const query = new URLSearchParams({
        pageSize: String(PAGE_SIZE),
        page: String(page),
    });
    if (status && status !== "alle") query.set("status", status);

    const data = await apiJson<PhotonFineUserList>(
        `/groups/${encodeURIComponent(groupSlug)}/fines/users?${query}`
    );

    return {
        results: data.users.map(toFineLeaderboardEntry),
        next: data.nextPage,
        totalCount: data.totalCount,
    };
}
