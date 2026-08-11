import { API_URL } from "@/actions/constant";
import { getValidAccessToken, ISSUER, refreshSession } from "@/lib/auth/photon";
import { emitSessionLost } from "@/lib/auth/session-events";

export class UnauthorizedError extends Error {
    constructor() {
        super("Sesjonen er utløpt");
        this.name = "UnauthorizedError";
    }
}

/**
 * Om svaret betyr «tokenet duger ikke», uansett hvilken status det kom med.
 *
 * API-et svarer 401 slik man venter. Auth-endepunktene gjør det ikke:
 * `/oauth2/userinfo` kjører tokenet gjennom introspeksjon først, og et utløpt
 * token blir da et token uten scope — som svarer 400 «Missing required
 * scope». Uten denne linja så appen 400 som en vanlig feil, hoppet over
 * fornyelsen, og profilsiden ble stående på «Forespørselen feilet (400)»
 * resten av sesjonen.
 */
function isTokenRejection(url: string, response: Response): boolean {
    if (response.status === 401) return true;
    return response.status === 400 && url.startsWith(ISSUER);
}

/**
 * Fetch against Photon with the OAuth access token attached.
 *
 * Photon takes the token as a normal bearer — the same JWKS and issuer the web
 * client uses — so nothing here is mobile-specific except where the token is
 * stored. Lepton wanted it in `X-Csrf-Token`, which is why every call site has
 * to change.
 *
 * A 401 is retried exactly once after refreshing. Once, not in a loop: if the
 * fresh token is rejected too, the session is genuinely gone and retrying
 * would just hammer the API on every screen.
 */
export async function apiFetch(
    path: string,
    init: RequestInit = {},
): Promise<Response> {
    const token = await getValidAccessToken();
    if (!token) {
        emitSessionLost();
        throw new UnauthorizedError();
    }

    const url = path.startsWith("http") ? path : `${API_URL}${path}`;
    const send = (bearer: string) =>
        fetch(url, {
            ...init,
            headers: {
                "Content-Type": "application/json",
                ...(init.headers ?? {}),
                Authorization: `Bearer ${bearer}`,
            },
        });

    const response = await send(token);
    if (!isTokenRejection(url, response)) return response;

    const refreshed = await refreshSession();
    if (!refreshed) throw new UnauthorizedError();

    const retried = await send(refreshed);
    // Et ferskt token som også blir avvist betyr at sesjonen er borte for
    // godt. Å gi svaret videre ville vist «(400)» eller «(401)» på skjermen i
    // stedet for å sende brukeren til innloggingen.
    if (isTokenRejection(url, retried)) {
        emitSessionLost();
        throw new UnauthorizedError();
    }

    return retried;
}

/** apiFetch plus JSON parsing, throwing on a non-2xx response. */
export async function apiJson<T>(
    path: string,
    init: RequestInit = {},
): Promise<T> {
    const response = await apiFetch(path, init);

    if (!response.ok) {
        // Photon's error handler returns { message }, but a proxy or a crash
        // can still put HTML on the wire — never let a parse failure mask the
        // status code the caller needs to see.
        let message = `Forespørselen feilet (${response.status})`;
        try {
            const body = (await response.json()) as { message?: string };
            if (body?.message) message = body.message;
        } catch {
            // keep the status-based message
        }
        throw new Error(message);
    }

    return (await response.json()) as T;
}
