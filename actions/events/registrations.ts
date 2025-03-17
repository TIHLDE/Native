
import { getToken } from "@/lib/storage/tokenStore";
import { BASE_URL } from "../constant";
import { LeptonError, Event, Registration } from "../types";
import me from "../users/me";

export async function iAmRegisteredToEvent(eventId: number): Promise<Registration | null> {

    // TODO: WE SHOULD MOVE THIS TO A TOKEN!!!! OR USE A CACHED QUERY!!
    const userId = await me().then((user) => user.user_id);

    const url = `${BASE_URL}/events/${eventId}/registrations/${userId}/`;
    const token = await getToken();

    const response = await fetch(url, {
        method: "GET",
        //@ts-expect-error
        headers: {
            "X-Csrf-Token": token,
        }
    });

    // This most likely means that the user is not registered to the event
    if (!response.ok) {
        return null;
    }

    const data = await response.json() as Registration;
    return data;
}

export async function registerToEvent(eventId: number): Promise<Registration> {
    const url = `${BASE_URL}/events/${eventId}/registrations/`;
    const token = await getToken();

    const response = await fetch(url, {
        method: "POST",
        //@ts-expect-error
        headers: {
            "X-Csrf-Token": token,
        }
    });

    if (!response.ok) {
        const errorData = await response.json() as LeptonError;
        throw new Error(errorData.detail);
    }

    const data = await response.json() as Registration;
    return data;
}

export async function unregisterFromEvent(eventId: number): Promise<string> {
    const userId = await me().then((user) => user.user_id);

    // Hvorfor må man legge til userId her?? Er index washed?
    const url = `${BASE_URL}/events/${eventId}/registrations/${userId}/`;
    const token = await getToken();

    const response = await fetch(url, {
        method: "DELETE",

        //@ts-expect-error
        headers: {
            "X-Csrf-Token": token,
        }
    });

    if (!response.ok) {
        const errorData = await response.json() as LeptonError;
        throw new Error(errorData.detail);
    }

    const data = await response.json();
    return data.detail;
}