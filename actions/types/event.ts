
export type Event = {
    // Photon bruker UUID der Lepton hadde løpenummer.
    id: string;
    title: string;
    start_date: string;
    end_date: string;
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
    contact_person?: {
        first_name: string;
        last_name: string;
    };
    /** Bare satt for arrangementer som faktisk koster noe. */
    paid_information?: {
        /** Hele kroner. Photon oppgir øre — omregningen skjer i `toEvent`. */
        price: string;
    };
    limit: number;
    list_count: string;
    waiting_list_count: string;
    sign_off_deadline: string;
    end_registration_at: string;
    start_registration_at: string;
    sign_up?: boolean;
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
