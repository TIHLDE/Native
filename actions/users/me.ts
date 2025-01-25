
import { getToken } from "@/lib/storage";
import { BASE_URL } from "../constant";
import { LeptonError, User, Event } from "../types";

export default async function me(): Promise<User> {
    const url = `${BASE_URL}/users/me/`;
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
};

export async function myEvents(): Promise<{ results: Event[] }> {
    const url = `${BASE_URL}/users/me/events/`;
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

    const data = await response.json() as { results: Event[] };
    return data;
}

export async function myPreviousEvents(): Promise<{ results: Event[] }> {
    const queryParams = new URLSearchParams({
        expired: "true",
    });

    const url = `${BASE_URL}/users/me/events/?${queryParams}`;
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

    const data = await response.json() as { results: Event[] };
    return data;
}