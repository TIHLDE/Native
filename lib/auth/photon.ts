import * as AuthSession from "expo-auth-session";
import { BASE_URL } from "@/actions/constant";
import { deleteToken, getSession, setSession } from "@/lib/storage/tokenStore";

/**
 * Photon's OIDC issuer. Discovery lives one level below it, and expo-auth-session
 * appends `/.well-known/openid-configuration` itself.
 */
export const ISSUER = `${BASE_URL}/api/auth`;

/**
 * The app is a PUBLIC OAuth client: anything shipped in the binary is readable
 * by anyone who downloads it, so there is no client secret here. Photon
 * advertises PKCE (S256), which is what makes that safe — the authorization
 * code is useless without the verifier this device generated.
 */
export const CLIENT_ID =
    process.env.EXPO_PUBLIC_PHOTON_CLIENT_ID ?? "tihlde-mobile";

export const SCOPES = ["openid", "profile", "email", "offline_access"];

export const discovery: AuthSession.DiscoveryDocument = {
    authorizationEndpoint: `${ISSUER}/oauth2/authorize`,
    tokenEndpoint: `${ISSUER}/oauth2/token`,
    userInfoEndpoint: `${ISSUER}/oauth2/userinfo`,
    revocationEndpoint: `${ISSUER}/oauth2/revoke`,
};

export function makeRedirectUri(): string {
    return AuthSession.makeRedirectUri({ scheme: "tihlde", path: "oauth" });
}

/**
 * Refresh a little before the token actually dies. A request that starts valid
 * can still arrive expired on a slow connection, and the clock on the device is
 * not guaranteed to agree with the server's.
 */
const EXPIRY_SKEW_MS = 60_000;

export function isExpired(expiresAt: number): boolean {
    if (!expiresAt) return false;
    return Date.now() >= expiresAt - EXPIRY_SKEW_MS;
}

type TokenResponse = {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
};

/**
 * Trade an authorization code for tokens and store them.
 *
 * The verifier comes from the request that opened the browser — it never
 * leaves the device until this call, which is the whole point of PKCE.
 */
export async function exchangeCode(
    code: string,
    codeVerifier: string,
    redirectUri: string,
): Promise<void> {
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: CLIENT_ID,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
    });

    const res = await fetch(discovery.tokenEndpoint as string, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    if (!res.ok) {
        throw new Error(`Innlogging feilet (${res.status})`);
    }

    const data = (await res.json()) as TokenResponse;
    await setSession({
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? null,
        expiresInSeconds: data.expires_in,
    });
}

/**
 * Exchange the refresh token for a fresh access token.
 *
 * Returns null when the session cannot be renewed — a revoked or expired
 * refresh token — and clears the stored one so the app stops retrying with a
 * token the server has already rejected.
 */
export async function refreshSession(): Promise<string | null> {
    const stored = await getSession();
    if (!stored?.refreshToken) return null;

    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: stored.refreshToken,
        client_id: CLIENT_ID,
    });

    const res = await fetch(discovery.tokenEndpoint as string, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    if (!res.ok) {
        await deleteToken();
        return null;
    }

    const data = (await res.json()) as TokenResponse;
    await setSession({
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? null,
        expiresInSeconds: data.expires_in,
    });
    return data.access_token;
}

/**
 * A valid access token, refreshing first when the stored one is spent.
 * Null means the user has to log in again.
 */
export async function getValidAccessToken(): Promise<string | null> {
    const stored = await getSession();
    if (!stored) return null;
    if (!isExpired(stored.expiresAt)) return stored.accessToken;
    return await refreshSession();
}
