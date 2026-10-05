/**
 * Kallet nådde aldri serveren: ingen nett, DNS som feiler, eller Photon nede.
 *
 * Eget navn fordi det er noe annet enn at serveren svarte med en feil — da
 * er sesjonen fortsatt gyldig, og brukeren skal ikke sendes til innloggingen.
 */
export class NetworkError extends Error {
    constructor() {
        super("Fikk ikke kontakt med serveren. Sjekk nettforbindelsen.");
        this.name = "NetworkError";
    }
}

/**
 * `fetch` som kaster NetworkError i stedet for plattformens egen feil.
 *
 * Expos `fetch` er native, og på Android kommer feilen ut som
 * «fetch failed: java.net.ConnectException: …» — tekst som ellers havner
 * rett i feilmeldinger og toasts. Et svar med feilstatus kastes ikke her;
 * det er kallstedets sak, akkurat som med vanlig `fetch`.
 */
export async function request(
    input: string,
    init?: RequestInit,
): Promise<Response> {
    try {
        return await fetch(input, init);
    } catch {
        throw new NetworkError();
    }
}
