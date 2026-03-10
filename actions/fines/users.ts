import { BASE_URL } from "@/actions/constant";
import { getToken } from "@/lib/storage/tokenStore";
import { GroupUser, LeptonError } from "@/actions/types";

export async function fetchGroupUsers(
    groupSlug: string,
    search: string = "",
    page: number = 1
): Promise<{ count: number; results: GroupUser[] }> {
    const params = new URLSearchParams({
        in_group: groupSlug,
        page: page.toString(),
    });
    if (search) params.set("search", search);

    const token = await getToken();
    const response = await fetch(`${BASE_URL}/users/?${params}`, {
        headers: { "X-Csrf-Token": token ?? "" },
    });

    if (!response.ok) {
        const errorData = (await response.json()) as LeptonError;
        throw new Error(errorData.detail);
    }

    return response.json();
}
