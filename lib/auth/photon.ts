import * as AuthSession from "expo-auth-session";
import { BASE_URL } from "@/actions/constant";
import { emitSessionLost } from "@/lib/auth/session-events";
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

/**
 * Hvem tokenet er ment for (RFC 8707 `resource`).
 *
 * Uten den gir Photon et opakt token — en ren streng uten krav i seg — og API-et
 * avviser alt som krever innlogging med «Authentication required», fordi
 * `requireAuth` bare godtar signerte JWT-er. Ber vi om denne mottakeren får vi
 * en JWT i stedet, og resten av appen virker.
 *
 * Verdien må være en av utstederens godkjente mottakere; standarden er
 * utstederen selv.
 */
export const RESOURCE = ISSUER;

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

/**
 * Et ukjent utløp regnes som utløpt.
 *
 * Motsatt vei — å anta at et token uten kjent utløp fortsatt lever — betyr at
 * appen aldri fornyer av seg selv og i stedet venter på at et kall skal si
 * fra. `/oauth2/userinfo` sier fra med 400, som ikke ligner en utløpt sesjon,
 * og profilsiden ble stående på «Forespørselen feilet (400)» for godt.
 */
export function isExpired(expiresAt: number): boolean {
    if (!expiresAt) return true;
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
        resource: RESOURCE,
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
 * Fornyelsen som allerede er i gang, om noen.
 *
 * Photon roterer refresh-tokenet: hvert token kan brukes én gang, og brukes det
 * samme to ganger tolkes det som tyveri — da slettes hele kjeden og brukeren er
 * logget ut. En skjerm som henter tre ting samtidig fikk tre 401-er, som hver
 * startet sin egen fornyelse med det samme tokenet. Første gikk igjennom, de to
 * andre så ut som gjenbruk, og sesjonen røk.
 *
 * Derfor deler alle på det samme kallet: den som kommer først starter det,
 * resten venter på svaret.
 */
let inFlightRefresh: Promise<string | null> | null = null;

export function refreshSession(): Promise<string | null> {
    if (!inFlightRefresh) {
        inFlightRefresh = performRefresh().finally(() => {
            inFlightRefresh = null;
        });
    }
    return inFlightRefresh;
}

/**
 * Exchange the refresh token for a fresh access token.
 *
 * Returns null when the session cannot be renewed — a revoked or expired
 * refresh token — and clears the stored one so the app stops retrying with a
 * token the server has already rejected.
 */
async function performRefresh(): Promise<string | null> {
    const stored = await getSession();
    if (!stored?.refreshToken) {
        // Ingen vei tilbake til et gyldig token: si fra én gang, så appen kan
        // sende brukeren til innloggingen framfor å vise feil på hver side.
        await deleteToken();
        emitSessionLost();
        return null;
    }

    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: stored.refreshToken,
        client_id: CLIENT_ID,
        // Må med her også: mottakeren avgjøres per utstedelse, så uten den
        // faller man tilbake til et opakt token ved første fornyelse.
        resource: RESOURCE,
    });

    const res = await fetch(discovery.tokenEndpoint as string, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    if (!res.ok) {
        await deleteToken();
        emitSessionLost();
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
