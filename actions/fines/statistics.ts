import { apiJson } from "@/lib/api/client";
import { FineStatistics } from "@/actions/types";
import { PhotonFineStatistics, toFineStatistics } from "@/actions/photon";

/**
 * Summene per stadium i oppgjøret: til godkjenning, godkjent men ubetalt, og
 * betalt. Avviste bøter er holdt utenfor av Photon.
 *
 * Med `userId` er det de samme tre summene for ett medlem. For et tidligere
 * medlem er de ubetalte summene 0, mens `paid` fortsatt telles.
 *
 * Svarer 404 når gruppa ikke har bøter aktivert, så kallet skal ikke gjøres for
 * slike grupper.
 */
export async function fetchFineStatistics(
    groupSlug: string,
    userId?: string
): Promise<FineStatistics> {
    const query = userId ? `?${new URLSearchParams({ userId })}` : "";
    const statistics = await apiJson<PhotonFineStatistics>(
        `/groups/${encodeURIComponent(groupSlug)}/fines/statistics${query}`
    );
    return toFineStatistics(statistics);
}
