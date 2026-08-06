import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN = "tihlde_access_token";
const REFRESH_TOKEN = "tihlde_refresh_token";
const EXPIRES_AT = "tihlde_expires_at";

export type StoredSession = {
    accessToken: string;
    refreshToken: string | null;
    /** Epoch milliseconds. 0 when unknown. */
    expiresAt: number;
};

export async function getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(ACCESS_TOKEN);
};

export async function getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(REFRESH_TOKEN);
};

/**
 * Photon's access tokens are short-lived, so the expiry is kept next to them.
 * Without it the app cannot tell a valid token from a stale one until a
 * request comes back 401, and the user sees a flash of broken screens first.
 */
export async function getExpiresAt(): Promise<number | null> {
    const raw = await SecureStore.getItemAsync(EXPIRES_AT);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
};

export async function getSession(): Promise<StoredSession | null> {
    const [accessToken, refreshToken, expiresAt] = await Promise.all([
        getToken(),
        getRefreshToken(),
        getExpiresAt(),
    ]);
    if (!accessToken) return null;
    return { accessToken, refreshToken, expiresAt: expiresAt ?? 0 };
};

export async function setSession(session: {
    accessToken: string;
    refreshToken?: string | null;
    expiresInSeconds?: number;
}): Promise<void> {
    const writes: Promise<void>[] = [
        SecureStore.setItemAsync(ACCESS_TOKEN, session.accessToken),
    ];

    // A refresh response may omit the refresh token, which means "keep the one
    // you have". Deleting it here would log the user out on the next refresh
    // instead of extending the session.
    if (session.refreshToken) {
        writes.push(
            SecureStore.setItemAsync(REFRESH_TOKEN, session.refreshToken),
        );
    }

    if (session.expiresInSeconds) {
        const expiresAt = Date.now() + session.expiresInSeconds * 1000;
        writes.push(SecureStore.setItemAsync(EXPIRES_AT, String(expiresAt)));
    }

    await Promise.all(writes);
};

/** Kept for callers that only need to stash a raw access token. */
export async function setToken(token: string): Promise<void> {
    await setSession({ accessToken: token });
};

export async function deleteToken(): Promise<boolean> {
    try {
        await Promise.all([
            SecureStore.deleteItemAsync(ACCESS_TOKEN),
            SecureStore.deleteItemAsync(REFRESH_TOKEN),
            SecureStore.deleteItemAsync(EXPIRES_AT),
        ]);
        return true;
    } catch {
        return false;
    }
};
