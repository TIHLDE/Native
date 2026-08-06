import { apiFetch, apiJson } from "@/lib/api/client";
import { CreateFinePayload } from "@/actions/types";

/**
 * Oppretter bot på én eller flere medlemmer.
 *
 * Lepton tok imot en liste med mottakere i ett kall. Photon oppretter én bot
 * per bruker, så flere mottakere blir flere kall — sendt parallelt, slik at
 * det tar like lang tid som den tregeste og ikke summen.
 *
 * Feiler én av dem, kastes feilen videre: en delvis utdelt bot skal ikke se ut
 * som en vellykket.
 */
export async function createFine(
    groupSlug: string,
    payload: CreateFinePayload
): Promise<void> {
    await Promise.all(
        payload.user.map((userId) =>
            apiFetch(`/groups/${encodeURIComponent(groupSlug)}/fines`, {
                method: "POST",
                body: JSON.stringify({
                    userId,
                    groupSlug,
                    // Photon har ett fritekstfelt der Lepton hadde både
                    // description og reason.
                    reason: payload.reason || payload.description,
                    amount: payload.amount,
                    ...(payload.image ? { image: payload.image } : {}),
                }),
            }).then(async (response) => {
                if (!response.ok) {
                    const body = (await response.json().catch(() => null)) as
                        | { message?: string }
                        | null;
                    throw new Error(
                        body?.message ?? `Kunne ikke gi bot (${response.status})`
                    );
                }
            })
        )
    );
}
