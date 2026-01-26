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

    let data: any;
    
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

        data = await fallbackResponse.json();
    } else {
        data = await response.json();
    }

    // Debug logging to see what the API actually returns
    console.log(`[getGroupMembers] Response for ${groupSlug}:`, {
        isArray: Array.isArray(data),
        hasResults: !!data.results,
        dataType: typeof data,
        keys: data && typeof data === 'object' ? Object.keys(data) : null,
        firstItem: Array.isArray(data) && data.length > 0 ? data[0] : (data.results && data.results.length > 0 ? data.results[0] : null),
        rawData: JSON.stringify(data, null, 2).substring(0, 500), // First 500 chars for debugging
    });

    // Handle different possible response structures
    let users: any[] = [];
    
    if (Array.isArray(data)) {
        // Direct array of users or membership objects
        users = data;
    } else if (data.results && Array.isArray(data.results)) {
        // Paginated response with results array
        users = data.results;
    } else if (data && typeof data === 'object') {
        // Single object or other structure - try to extract
        console.warn(`[getGroupMembers] Unexpected response structure for ${groupSlug}:`, data);
        users = [];
    }

    // Extract users from the array - handle both direct user objects and nested structures
    const extractedUsers: User[] = users
        .map((item: any) => {
            // If item is already a User (has user_id, first_name, etc.), return it
            if (item && typeof item === 'object' && item.user_id && item.first_name) {
                return item as User;
            }
            // If item has a nested 'user' property, extract it
            if (item && typeof item === 'object' && item.user) {
                return item.user as User;
            }
            // If item has a nested 'member' property, extract it
            if (item && typeof item === 'object' && item.member) {
                return item.member as User;
            }
            // Otherwise, try to use item as-is if it looks like a user
            if (item && typeof item === 'object' && (item.user_id || item.email)) {
                return item as User;
            }
            return null;
        })
        .filter((user): user is User => user !== null && user !== undefined);

    console.log(`[getGroupMembers] Extracted ${extractedUsers.length} users for ${groupSlug}`);
    
    return extractedUsers;
}

