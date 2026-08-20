import { apiJson } from "@/lib/api/client";
import { Payment } from "../types";
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
    return apiJson<Payment>(
        `/event/${encodeURIComponent(String(eventid))}/payment`,
        {
            method: "POST",
            body: JSON.stringify({
                returnUrl: Linking.createURL(`/arrangement/${eventid}`),
                userFlow: "NATIVE_REDIRECT",
            }),
        }
    );
}
