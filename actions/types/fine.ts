import { Group } from "./group";
import { User } from "./user";

export type Membership = {
    created_at: string;
    expiration_date: string | null;
    group: Group;
    membership_type: string;
    user: User;
};

export type Law = {
    id: string;
    amount: number;
    description: string;
    paragraph: string;
    title: string;
};

export type GroupUser = {
    user_id: string;
    first_name: string;
    last_name: string;
    image?: string;
    email: string;
    gender: number;
};

export type CreateFinePayload = {
    description: string;
    amount: number;
    reason: string;
    user: string[];
    image: string | null;
};

/**
 * Der en bot står i oppgjøret. Photon typer feltet som fri streng i skjemaet
 * selv om ruten validerer mot disse fire, så mapperen smalner den her.
 */
export type FineStatus = "pending" | "approved" | "paid" | "rejected";

/** Den lille brukerformen bøtelistene svarer med — ikke en hel `User`. */
export type FinePerson = {
    id: string;
    name: string;
    image: string | null;
};

export type Fine = {
    id: string;
    userId: string;
    groupSlug: string;
    reason: string;
    /**
     * Antall bøter, ikke kroner.
     *
     * Photons skjema kaller feltet «Fine amount in NOK», men det stemmer ikke
     * med hvordan det faktisk brukes: lovverket teller bøter per paragraf, og
     * bekreft-skjermen i botflyten merker det samme feltet «Antall bøter».
     * Kroneverdien er noe hver gruppe avtaler selv utenfor appen.
     */
    amount: number;
    defense: string | null;
    /** Bevisbildet, i full størrelse. Ikke en avatar. */
    image: string | null;
    status: FineStatus;
    createdAt: string;
    approvedAt: string | null;
    paidAt: string | null;
    user: FinePerson;
    createdByUser: FinePerson | null;
    /** Null for bøter fra Lepton og for bøter gitt uten paragraf. */
    law: { id: string; paragraph: string; title: string } | null;
};

/**
 * Antall bøter per stadium i oppgjøret. Avviste bøter er holdt utenfor.
 *
 * Tallene er summer av `Fine.amount`, altså bøter — ikke kroner.
 */
export type FineStatistics = {
    notApproved: number;
    approvedNotPaid: number;
    paid: number;
};

export type FineLeaderboardEntry = {
    id: string;
    name: string;
    image: string | null;
    /** Summen av medlemmets `Fine.amount`, altså totalt antall bøter. */
    finesAmount: number;
    /** Antall ganger medlemmet har blitt bøtelagt. */
    finesCount: number;
};
