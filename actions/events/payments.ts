import { getToken } from "@/lib/storage";
import { BASE_URL } from "../constant";
import { LeptonError, Payment } from "../types";

export async function createPayment(eventid: number) {
    const url = `${BASE_URL}/payments/`;
    const token = await getToken();

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ event: eventid }),
        //@ts-expect-error
        headers: {
            "X-Csrf-Token": token,
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        const errorData = await response.json() as LeptonError;
        throw new Error(errorData.detail);
    }

    const data = await response.json() as Payment;
    return data;
}