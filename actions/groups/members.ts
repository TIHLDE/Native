import { apiJson } from "@/lib/api/client";
import { GroupMember } from "@/actions/types";
import { PhotonGroupMember, toGroupMember } from "@/actions/photon";

/**
 * Hele medlemslista til en gruppe, med rolle.
 *
 * Photon svarer med alle medlemmene i ett kall uten paginering. Gruppene er
 * små nok til at det holder. Medlemsfanen og snittene i bøtefanen deler cache
 * på denne. Botflytens personvelger går via `fetchGroupUsers`, som søker og
 * paginerer lokalt og har sin egen nøkkel per søk.
 */
export async function fetchGroupMembers(
    groupSlug: string
): Promise<GroupMember[]> {
    const members = await apiJson<PhotonGroupMember[]>(
        `/groups/${encodeURIComponent(groupSlug)}/members`
    );
    return members.map(toGroupMember);
}
