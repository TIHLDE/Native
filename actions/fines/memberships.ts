import { apiJson } from "@/lib/api/client";
import { Membership } from "@/actions/types";
import { PhotonGroup, toMembership } from "@/actions/photon";

export async function fetchMemberships(): Promise<Membership[]> {
    // Photon svarer med gruppene direkte og medlemskapet nøstet inni, der
    // Lepton pakket alt i { results: [...] }.
    const groups = await apiJson<PhotonGroup[]>("/groups/mine");
    return groups.filter((group) => group.membership).map(toMembership);
}
