/**
 * Brukerinnstillingene Photon holder på `/user/me/settings`.
 *
 * `isOnboarded` er med i svaret fra API-et, men ikke her: appen har ingen
 * onboarding-flyt å sende noen til, så flagget ville bare vært et felt ingen
 * leser. Alt annet er noe innstillingsskjermen faktisk viser.
 */
export type UserSettings = {
    /** Kreves for å melde seg på arrangementer. Photon avviser påmelding uten. */
    acceptsEventRules: boolean;
    /** Bildesamtykke: om bilder av deg fra arrangementer kan publiseres. */
    allowsPhotosByDefault: boolean;
    /** Om navnet ditt vises i deltakerlister. */
    publicEventRegistrations: boolean;
    /** Om TIHLDE kan sende deg e-post. */
    receiveMailCommunication: boolean;
    /** Slugene fra allergikatalogen, ikke fritekst. */
    allergies: string[];
};

/** En rad i allergikatalogen — `/user/allergy`. */
export type Allergy = {
    slug: string;
    label: string;
    description: string | null;
};

/**
 * Hvor varsler skal komme.
 *
 * Photon har ingen samlet innstilling for dette: e-post er
 * `receiveMailCommunication` på brukerinnstillingene, mens push er om
 * telefonen er meldt på i `/notification/device`. Valget her er de to
 * kombinert, sånn at brukeren forholder seg til ett spørsmål.
 */
export type NotificationChannel = "none" | "email" | "push" | "both";
