import { apiJson } from "@/lib/api/client";
import { Law } from "@/actions/types";
import { PhotonLaw, toLaw } from "@/actions/photon";

export async function fetchLaws(groupSlug: string): Promise<Law[]> {
    const laws = await apiJson<PhotonLaw[]>(
        `/groups/${encodeURIComponent(groupSlug)}/laws`
    );
    return laws.map(toLaw);
}
