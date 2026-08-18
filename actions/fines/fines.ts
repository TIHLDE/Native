import { apiFetch, apiJson } from "@/lib/api/client";
import { CreateFinePayload, Fine, FineStatus } from "@/actions/types";
import { PhotonFineList, toFine } from "@/actions/photon";

export const PAGE_SIZE = 25;

/**
 * Bøtene i en gruppe, nyeste først.
 *
 * Sidetallet er 0-basert i Photon, og `nextPage` er null på siste side. Den
 * sendes videre som den er framfor å telles opp her — å regne den ut lokalt gir
 * en tom side til etter at lista er slutt.
 */
export async function fetchFines(
    groupSlug: string,
    options: { page?: number; status?: FineStatus; userId?: string } = {}
): Promise<{ results: Fine[]; next: number | null; totalCount: number }> {
    const query = new URLSearchParams({
        pageSize: String(PAGE_SIZE),
        page: String(options.page ?? 0),
    });
    if (options.status) query.set("status", options.status);
    if (options.userId) query.set("userId", options.userId);

    const data = await apiJson<PhotonFineList>(
        `/groups/${encodeURIComponent(groupSlug)}/fines?${query}`
    );

    return {
        results: data.fines.map(toFine),
        next: data.nextPage,
        totalCount: data.totalCount,
    };
}

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
