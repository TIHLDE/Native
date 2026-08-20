import { apiJson } from "@/lib/api/client";
import { PhotonPayment, toPayment } from "@/actions/photon";
import * as Linking from "expo-linking";

/**
 * Starter betaling for et arrangement.
 *
 * Lepton hadde en global /payments/-rute med arrangementet i kroppen. Photon
 * legger betalingen under arrangementet, så id-en flyttes til stien.
 */
export async function createPayment(eventid: string) {
    // `returnUrl` er påkrevd i Photon, og kallet gikk uten body i det hele
    // tatt — serveren fikk Content-Type: application/json og ingenting å
    // parse, så betaling feilet før den kom i gang.
    //
    // `NATIVE_REDIRECT` finnes nettopp for apper: betalingsleverandøren
    // sender brukeren tilbake til `tihlde://arrangement/<id>` i stedet for å
    // etterlate dem i nettleseren.
    const payment = await apiJson<PhotonPayment>(
        `/event/${encodeURIComponent(String(eventid))}/payment`,
        {
            method: "POST",
            body: JSON.stringify({
                returnUrl: Linking.createURL(`/arrangement/${eventid}`),
                userFlow: "NATIVE_REDIRECT",
            }),
        }
    );

    return toPayment(payment);
}

export type PaymentConfirmation = {
    /**
     * `pending` betyr at checkouten fortsatt er åpen, eller at Photon ikke
     * fikk svar fra Vipps: spør igjen om litt. `none` betyr at det ikke er
     * noen utestående betaling å bekrefte.
     */
    status: "paid" | "pending" | "failed" | "none";
};

/**
 * «Gikk betalinga gjennom?», spurt av medlemmet som nettopp kom tilbake fra
 * Vipps.
 *
 * Vipps sender medlemmet tilbake i det de har godkjent, som regel før
 * webhooken som registrerer betalingen har nådd Photon. Uten dette landet de
 * på «betal for å sikre den» rett etter å ha betalt, og eneste vei ut var å
 * dra ned til webhooken tilfeldigvis hadde kommet.
 *
 * Ruta ser bare på kallerens egen betaling.
 */
export async function confirmPayment(
    eventId: string
): Promise<PaymentConfirmation> {
    return apiJson<PaymentConfirmation>(
        `/event/${encodeURIComponent(String(eventId))}/payment/confirm`,
        { method: "POST", body: JSON.stringify({}) }
    );
}
