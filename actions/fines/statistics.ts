import { apiJson } from "@/lib/api/client";
import { FineStatistics } from "@/actions/types";
import { PhotonFineStatistics, toFineStatistics } from "@/actions/photon";

/**
 * Summene per stadium i oppgjøret: til godkjenning, godkjent men ubetalt, og
 * betalt. Avviste bøter er holdt utenfor av Photon.
 *
 * Svarer 404 når gruppa ikke har bøter aktivert, så kallet skal ikke gjøres for
 * slike grupper.
 */
export async function fetchFineStatistics(
    groupSlug: string
): Promise<FineStatistics> {
    const statistics = await apiJson<PhotonFineStatistics>(
        `/groups/${encodeURIComponent(groupSlug)}/fines/statistics`
    );
    return toFineStatistics(statistics);
}
