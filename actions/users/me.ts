
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
    
    // Debug logging to see what the API actually returns
    console.log("[myMemberships] Raw API response:", JSON.stringify(data, null, 2));
    
    // Handle different possible response structures
    let rawItems: any[] = [];
    if (Array.isArray(data)) {
        rawItems = data;
    } else if (data.results && Array.isArray(data.results)) {
        rawItems = data.results;
    }
    
    // Extract the nested group objects from the membership structure
    // The API returns: { group: { ...group data... }, membership_type: "...", ... }
    const groups: Group[] = rawItems
        .map((item) => {
            // If the item has a nested 'group' property, extract it
            if (item.group && typeof item.group === 'object') {
                return item.group as Group;
            }
            // Otherwise, assume the item itself is a group
            return item as Group;
        })
        .filter((group): group is Group => group !== null && group !== undefined);
    
    // Debug each group to see if fines_activated is present
    console.log("[myMemberships] Processed groups:", groups.length);
    groups.forEach((group, index) => {
        console.log(`[myMemberships] Group ${index} (${group.slug}):`, {
            fines_activated: group.fines_activated,
            fines_activated_type: typeof group.fines_activated,
            all_keys: Object.keys(group),
        });
    });
    
    return groups;
}