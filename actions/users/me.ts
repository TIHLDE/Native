
import { getToken } from "@/lib/storage/tokenStore";
import { BASE_URL } from "../constant";
import { LeptonError, User, Event, Permissions, Group } from "../types";
import { useQuery } from "@tanstack/react-query";

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

export async function updateUserProfile(updates: {
    bio?: string;
    github?: string;
    linkedin?: string;
    allergies?: string;
}): Promise<User> {
    const url = `${BASE_URL}/users/me/`;
    const token = await getToken();

    const response = await fetch(url, {
        method: "PATCH",
        //@ts-expect-error
        headers: {
            "X-Csrf-Token": token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
    });

    if (!response.ok) {
        const errorData = await response.json() as LeptonError;
        throw new Error(errorData.detail);
    }

    const data = await response.json() as User;
    return data;
}

export async function myPermissions(): Promise<Permissions> {
    const url = `${BASE_URL}/users/me/permissions/`;
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

    const data = await response.json();
    return data.permissions as Permissions;
}

export function usePermissions() {
    return useQuery({
        queryKey: ["permissions",],
        queryFn: myPermissions,
    });
}


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

export async function myMemberships(): Promise<Group[]> {
    const url = `${BASE_URL}/users/me/memberships/`;
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

    const data = await response.json();
    // Handle different possible response structures
    if (Array.isArray(data)) {
        return data as Group[];
    }
    if (data.results && Array.isArray(data.results)) {
        return data.results as Group[];
    }
    return [];
}