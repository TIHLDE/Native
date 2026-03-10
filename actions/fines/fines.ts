import { BASE_URL } from "@/actions/constant";
import { getToken } from "@/lib/storage/tokenStore";
import { CreateFinePayload, LeptonError } from "@/actions/types";

export async function createFine(
    groupSlug: string,
    payload: CreateFinePayload
): Promise<void> {
    const token = await getToken();
    const response = await fetch(`${BASE_URL}/groups/${groupSlug}/fines/`, {
        method: "POST",
        headers: {
            "X-Csrf-Token": token ?? "",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = (await response.json()) as LeptonError;
        throw new Error(errorData.detail);
    }
}
