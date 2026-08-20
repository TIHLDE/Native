export type Payment = {
    eventId: string;
    userId: string;
    /** Vipps-checkouten brukeren skal sendes til. */
    checkoutUrl: string;
    /** Beløp i øre, slik Photon oppgir det. */
    amount: number;
    currency: string;
};
