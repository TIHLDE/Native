import { apiJson } from "@/lib/api/client";
import { GroupListItem } from "@/actions/types";
import { PhotonGroupListItem, toGroupListItem } from "@/actions/photon";

/**
 * Alle aktive grupper, også dem brukeren ikke er med i — gruppesida og
 * medlemslista er åpne for alle innloggede.
 *
 * Photon lister private grupper til alle, men gruppesida deres svarer 403 for
 * dem som ikke er med. Det utvalget gjøres i `groupSections`, der
 * medlemskapene er kjent.
 */
export async function fetchGroups(): Promise<GroupListItem[]> {
    const groups = await apiJson<PhotonGroupListItem[]>("/groups");
    return groups.map(toGroupListItem);
}
