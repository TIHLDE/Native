import { BASE_URL } from "@/actions/constant";
import { getToken } from "@/lib/storage/tokenStore";
import { Membership, LeptonError } from "@/actions/types";

export async function fetchMemberships(): Promise<Membership[]> {
    const token = await getToken();
    const response = await fetch(`${BASE_URL}/users/me/memberships/`, {
        headers: { "X-Csrf-Token": token ?? "" },
    });

    if (!response.ok) {
        const errorData = (await response.json()) as LeptonError;
        throw new Error(errorData.detail);
    }

    const data = await response.json();
    return data.results;
}
