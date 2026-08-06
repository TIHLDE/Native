import { apiJson } from "@/lib/api/client";
import { Payment } from "../types";

/**
 * Starter betaling for et arrangement.
 *
 * Lepton hadde en global /payments/-rute med arrangementet i kroppen. Photon
 * legger betalingen under arrangementet, så id-en flyttes til stien.
 */
export async function createPayment(eventid: string) {
    return apiJson<Payment>(
        `/event/${encodeURIComponent(String(eventid))}/payment`,
        { method: "POST" }
    );
}
