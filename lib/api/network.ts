/**
 * Kallet nådde aldri serveren: ingen nett, DNS som feiler, eller Photon nede.
 *
 * Noe annet enn at serveren svarte med en feil — sesjonen er ikke avvist, og
 * brukeren skal ikke sendes til innloggingen.
 */
export class NetworkError extends Error {
    constructor() {
        super("Fikk ikke kontakt med serveren. Sjekk nettforbindelsen.");
        this.name = "NetworkError";
    }
}

/** Feilmeldingene fetch gir når kallet faktisk ikke kom fram. */
function isTransportError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    return (
        error.message.startsWith("fetch failed") || // expo/fetch (FetchError)
        error.message === "Network request failed" // React Natives fetch
    );
}

/**
 * `fetch` som skiller nettfeil fra andre feil før de når brukeren.
 *
 * - Et avbrutt kall kaster sin egen feil videre, uendret.
 * - En nettfeil blir NetworkError. Expos `fetch` er native, og på Android
 *   kommer feilen ut som «fetch failed: java.net.ConnectException: …» —
 *   tekst som ellers havner rett i feilmeldinger og toasts.
 * - Alt annet er en feil i selve kallet, for eksempel en body `expo/fetch`
 *   ikke klarer å kode. Den logges og kastes som en generell feil med den
 *   opprinnelige som `cause`, så den ikke forkles som et nettproblem.
 *
 * Et svar med feilstatus kastes ikke her; det er kallstedets sak, akkurat
 * som med vanlig `fetch`.
 */
export async function request(
    input: string,
    init?: RequestInit,
): Promise<Response> {
    try {
        return await fetch(input, init);
    } catch (error) {
        // Et avbrutt kall er ikke et nettproblem, og skal ikke se ut som et.
        if (init?.signal?.aborted) throw error;
        if (isTransportError(error)) throw new NetworkError();

        // Ikke et nettproblem, men en feil i kallet selv. Logges, så den ikke
        // forsvinner bak «sjekk nettforbindelsen» igjen.
        console.error("Kallet feilet før det ble sendt", input, error);
        const wrapped = new Error("Noe gikk galt med forespørselen. Prøv igjen.");
        (wrapped as Error & { cause?: unknown }).cause = error;
        throw wrapped;
    }
}
