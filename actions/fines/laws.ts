import { BASE_URL } from "@/actions/constant";
import { getToken } from "@/lib/storage/tokenStore";
import { Law, LeptonError } from "@/actions/types";

export async function fetchLaws(groupSlug: string): Promise<Law[]> {
    const token = await getToken();
    const response = await fetch(`${BASE_URL}/groups/${groupSlug}/laws/`, {
        headers: { "X-Csrf-Token": token ?? "" },
    });

    if (!response.ok) {
        const errorData = (await response.json()) as LeptonError;
        throw new Error(errorData.detail);
    }

    return response.json();
}
