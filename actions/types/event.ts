import type { Registration } from "./registration";

export type Event = {
    // Photon bruker UUID der Lepton hadde løpenummer.
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    location?: string;
    description?: string;
    image?: string;
    category?: {
        id: number;
        text: string;
    };
    organizer?: {
        name: string;
        slug: string;
    };
    contactPerson?: {
        firstName: string;
        lastName: string;
    };
    /** Bare satt for arrangementer som faktisk koster noe. */
    paidInformation?: {
        /** Hele kroner. Photon oppgir øre — omregningen skjer i `toEvent`. */
        price: string;
    };
    limit: number;
    /** Arrangøren har stengt påmeldingen manuelt. */
    closed?: boolean;
    /** Om fulle arrangementer har venteliste. Uten den er fullt endestasjon. */
    allowWaitlist?: boolean;
    isPaidEvent?: boolean;
    /** Innloggedes egen påmelding. Bare satt når kallet hadde token. */
    myRegistration?: Registration;
    listCount: string;
    waitingListCount: string;
    signOffDeadline: string;
    endRegistrationAt: string;
    startRegistrationAt: string;
    signUp?: boolean;
};
/**
 * Stillingsannonse i den formen skjermene leser. Photons felter er camelCase
 * og oversettes i actions/events/events.ts.
 */
export type JobPost = {
    id: string;
    title: string;
    company: string;
    location: string;
    body: string;
    ingress: string;
    job_type: string;
    class_start: number | string;
    class_end: number | string;
    deadline: string | null;
    email: string | null;
    link: string | null;
    image: string | null;
    expired: boolean;
};
