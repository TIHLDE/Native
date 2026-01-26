import { getToken } from "@/lib/storage/tokenStore";
import { BASE_URL } from "../constant";
import { LeptonError, GroupLaw, GroupFine, GroupFineCreate, User, Group } from "../types";

export async function getGroup(groupSlug: string): Promise<Group> {
    const url = `${BASE_URL}/groups/${groupSlug}/`;
    const token = await getToken();

    const response = await fetch(url, {
        method: "GET",
        //@ts-expect-error
        headers: {
            "X-Csrf-Token": token,
        }
    });

    if (!response.ok) {
        const errorData = await response.json() as LeptonError;
        throw new Error(errorData.detail);
    }

    const data = await response.json() as Group;
    
    // Debug logging to verify API response structure
    console.log(`[getGroup] Response for ${groupSlug}:`, {
        fines_activated: data.fines_activated,
        fines_admin: data.fines_admin,
        fines_admin_type: typeof data.fines_admin,
        fines_admin_keys: data.fines_admin ? Object.keys(data.fines_admin) : null,
        permissions: data.permissions,
        permissions_type: typeof data.permissions,
        permissions_keys: data.permissions ? Object.keys(data.permissions) : null,
        full_data: JSON.stringify(data, null, 2),
    });
    
    return data;
}

export async function getGroupLaws(groupSlug: string): Promise<GroupLaw[]> {
    const url = `${BASE_URL}/groups/${groupSlug}/laws/`;
    const token = await getToken();

    const response = await fetch(url, {
        method: "GET",
        //@ts-expect-error
        headers: {
            "X-Csrf-Token": token,
        }
    });

    if (!response.ok) {
        const errorData = await response.json() as LeptonError;
        throw new Error(errorData.detail);
    }

    return await response.json();
}

export async function createFine(groupSlug: string, fine: GroupFineCreate): Promise<GroupFine[]> {
    const url = `${BASE_URL}/groups/${groupSlug}/fines/`;
    const token = await getToken();

    const response = await fetch(url, {
        method: "POST",
        //@ts-expect-error
        headers: {
            "X-Csrf-Token": token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(fine),
    });

    if (!response.ok) {
        const errorData = await response.json() as LeptonError;
        throw new Error(errorData.detail);
    }

    // Backend returns an array of fines (batch creation)
    return await response.json();
}

export async function getGroupMembers(groupSlug: string): Promise<User[]> {
    // Try to get members from /groups/{slug}/members/ endpoint
    // If that doesn't exist, fall back to /groups/{slug}/fines/users/ which returns users with fines
    const url = `${BASE_URL}/groups/${groupSlug}/members/`;
    const token = await getToken();

    const response = await fetch(url, {
        method: "GET",
        //@ts-expect-error
        headers: {
            "X-Csrf-Token": token,
        }
    });

    if (!response.ok) {
        // If members endpoint doesn't exist, try fines/users endpoint
        const fallbackUrl = `${BASE_URL}/groups/${groupSlug}/fines/users/`;
        const fallbackResponse = await fetch(fallbackUrl, {
            method: "GET",
            //@ts-expect-error
            headers: {
                "X-Csrf-Token": token,
            }
        });

        if (!fallbackResponse.ok) {
            const errorData = await fallbackResponse.json() as LeptonError;
            throw new Error(errorData.detail);
        }

        // Extract users from fines/users response (structure may vary)
        const data = await fallbackResponse.json();
        // Handle different possible response structures
        if (Array.isArray(data)) {
            return data.map((item: any) => item.user || item).filter(Boolean);
        }
        if (data.results && Array.isArray(data.results)) {
            return data.results.map((item: any) => item.user || item).filter(Boolean);
        }
        return [];
    }

    const data = await response.json();
    // Handle different possible response structures
    if (Array.isArray(data)) {
        return data.map((item: any) => item.user || item).filter(Boolean);
    }
    if (data.results && Array.isArray(data.results)) {
        return data.results.map((item: any) => item.user || item).filter(Boolean);
    }
    return [];
}

