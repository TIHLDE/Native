import { apiJson } from "@/lib/api/client";
import { Group } from "@/actions/types";
import { PhotonGroupDetail, toGroup } from "@/actions/photon";

/**
 * Én gruppe slik den står på egen side.
 *
 * `/groups/mine` gir det meste av dette allerede, men ikke `leaderTitle` —
 * hva gruppa kaller lederen sin. Photon avstemmer den mot vervet i
 * Hovedstyret, så det kan ikke utledes fra medlemslista.
 */
export async function fetchGroup(groupSlug: string): Promise<Group> {
    const group = await apiJson<PhotonGroupDetail>(
        `/groups/${encodeURIComponent(groupSlug)}`
    );
    return toGroup(group);
}
