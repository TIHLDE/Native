import { getToken } from "@/lib/storage/tokenStore";
import { BASE_URL } from "../constant";
import { LeptonError, User } from "../types";

export async function getUser(id: string): Promise<User> {
    const url = `${BASE_URL}/users/${id}/`;
    const token = await getToken();

    const response = await fetch(url, {
        //@ts-expect-error
        headers: {
            "method": "GET",
            "X-Csrf-Token": token,
        }
    });

    if (!response.ok) {
        const errorData = await response.json() as LeptonError;
        throw new Error(errorData.detail);
    }

    const data = await response.json() as User;
    return data;
}