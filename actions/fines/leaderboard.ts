import { apiJson } from "@/lib/api/client";
import { FineLeaderboardEntry } from "@/actions/types";
import { PhotonFineUserList, toFineLeaderboardEntry } from "@/actions/photon";
import { PAGE_SIZE } from "./fines";

/**
 * Medlemmene i gruppa med summen av bøtene sine, høyest først.
 *
 * Photon sorterer allerede — ikke sorter på nytt her. Medlemmer uten bøter er
 * med, med 0, så lista er hele medlemslista og ikke bare de som har fått noe.
 *
 * Svarer 404 når gruppa ikke har bøter aktivert, så kallet skal ikke gjøres for
 * slike grupper.
 */
export async function fetchFineLeaderboard(
    groupSlug: string,
    page: number = 0
): Promise<{
    results: FineLeaderboardEntry[];
    next: number | null;
    totalCount: number;
}> {
    const query = new URLSearchParams({
        pageSize: String(PAGE_SIZE),
        page: String(page),
    });

    const data = await apiJson<PhotonFineUserList>(
        `/groups/${encodeURIComponent(groupSlug)}/fines/users?${query}`
    );

    return {
        results: data.users.map(toFineLeaderboardEntry),
        next: data.nextPage,
        totalCount: data.totalCount,
    };
}
