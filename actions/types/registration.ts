import { User } from "./user";

export type Registration = {
    hasAttended: boolean;
    hasPaidOrder: boolean;
    hasUnansweredEvaluation: boolean;
    isOnWait: boolean;
    paymentExpireDate: string;
    paymentOrders: string[];
    waitQueueNumber: number;
    registrationId: number;
    /** Photons egen status. Avgjør hvilken tilstand påmeldingskortet viser. */
    status?:
        | "registered"
        | "waitlisted"
        | "cancelled"
        | "attended"
        | "no_show"
        | "pending";
    userInfo: User;
}