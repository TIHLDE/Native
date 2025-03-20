import { getToken } from "@/lib/storage/tokenStore";
import { BASE_URL } from "../constant";
import { LeptonError, Registration, User } from "../types";

export async function eventParticipants(eventId: number, pageParam: number): Promise<Registration[] | null> {
    const resultsPerPage = 10;
    const token = await getToken();

    const queryParams = new URLSearchParams({
        page: pageParam.toString(),
        None: resultsPerPage.toString(),
    });

    const url = `${BASE_URL}/events/${eventId}/registrations/?${queryParams}`;

    const response = await fetch(url, {
        method: "GET",
        //@ts-expect-error
        headers: {
            "X-Csrf-Token": token,
        }
    });

    if (!response.ok) {
        const errorData = await response.json() as LeptonError;
        if (errorData.detail === "Invalid page.") {
            return [];
        }

        throw new Error(errorData.detail);
    }

    const data = await response.json().then((data) => data.results) as Registration[];
    return data;
}

export async function publicEventParticipants(eventId: number, pageParam: number): Promise<Registration[] | null> {
    const resultsPerPage = 10;
    const token = await getToken();

    const queryParams = new URLSearchParams({
        page: pageParam.toString(),
        None: resultsPerPage.toString(),
    });

    const url = `${BASE_URL}/events/${eventId}/public_registrations/?${queryParams}`;

    const response = await fetch(url, {
        method: "GET",
        // @ts-expect-error
        headers: {
            "X-Csrf-Token": token,
        }
    });

    if (!response.ok) {
        const errorData = await response.json() as LeptonError;
        if (errorData.detail === "Invalid page.") {
            return [];
        }

        throw new Error(errorData.detail);
    }

    const data = await response.json().then((data) => data.results) as Registration[];
    return data;
}

export async function updateEventParticipation(eventId: number, user_id: string, value: boolean): Promise<boolean> {
    const token = await getToken();

    const url = `${BASE_URL}/events/${eventId}/registrations/${user_id}/`;

    const response = await fetch(url, {
        method: "PUT",
        //@ts-expect-error
        headers: {
            "X-Csrf-Token": token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ has_attended: value })

    });

    if (!response.ok) {
        const errorData = await response.json() as LeptonError;
        throw new Error(errorData.detail);
    }
    return true;
}

export async function isEventParticipant(eventId: number, userId: string): Promise<boolean> {
    const url = `${BASE_URL}/events/${eventId}/registrations/${userId}/`;
    const token = await getToken();

    const response = await fetch(url, {
        //@ts-expect-error
        headers: {
            "method": "GET",
            "X-Csrf-Token": token,
        }
    });

    if (!response.ok) {
        if (response.status === 404) {
            return false;
        }

        const errorData = await response.json() as LeptonError;
        throw new Error(errorData.detail);
    }

    return true;
}