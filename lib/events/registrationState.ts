import type { Event, Registration } from "@/actions/types";

/**
 * Tilstandene påmeldingskortet kan stå i.
 *
 * Portert fra nettsidas `deriveRegistrationState`, slik at appen og nettsida
 * sier det samme om det samme arrangementet. Skjermen hadde tidligere en
 * håndfull løse booleans som ikke dekket venteliste, betaling eller en
 * påmelding som fortsatt behandles.
 */
export type EventRegistrationState =
    | "no-signup"
    | "not-open"
    | "open"
    | "processing"
    | "joined"
    | "awaiting-payment"
    | "cancelled"
    | "on-waitlist"
    | "closed"
    | "full";

/**
 * Facebook-gruppa der medlemmer kjøper og selger billetter. Samme gruppe som
 * nettsida lenker til, så folk finner igjen det de er vant til.
 */
export const TICKET_RESALE_GROUP_URL =
    "https://www.facebook.com/groups/598608738731749/";

/**
 * Avled tilstanden fra egen påmelding og arrangementets påmeldingsvindu.
 *
 * Hver grense teller selv om Photon uansett avviser en påmelding utenfor
 * vinduet: uten dem sto det en innbydende «Meld deg på» både før påmeldingen
 * åpnet og lenge etter at arrangementet var over, siden `closed` er et flagg
 * arrangørene sjelden setter.
 */
export function deriveRegistrationState(
    event: Event,
    registration: Registration | null | undefined,
    now: Date = new Date(),
): EventRegistrationState {
    // Arrangementer uten påmelding har ingenting å melde seg på.
    if (event.sign_up !== true) return "no-signup";

    const isPaidEvent =
        event.is_paid_event === true || Boolean(event.paid_information?.price);

    switch (registration?.status) {
        // En plass på et betalt arrangement er reservert, ikke sikret, før den
        // er betalt: det er der betalingsknappen hører hjemme. Uten dette fikk
        // medlemmet «Du har plass» og ingen måte å betale på — og plassen ble
        // tatt tilbake da fristen gikk ut.
        case "registered":
            return isPaidEvent && registration.has_paid_order !== true
                ? "awaiting-payment"
                : "joined";
        // Møtt opp betyr at arrangementet er i gang. Da er betalingen et
        // oppgjør mellom medlemmet og arrangøren, ikke en knapp her.
        case "attended":
            return "joined";
        case "waitlisted":
            return "on-waitlist";
        // Photon setter «cancelled» når plassen er tapt: betalingsfristen gikk
        // ut, påmeldingen kom inn på et stengt arrangement, eller prikkene
        // stengte den ute. Uten denne grenen falt tilstanden ned i `default` og
        // viste «Meld deg på» — en knapp som aldri kunne lykkes, siden Photon
        // svarer 409 så lenge raden ligger der.
        case "cancelled":
            return "cancelled";
        // Påmeldingen står som «pending» til serveren har avgjort om det ble
        // plass eller venteliste. Photon avviser betaling før det er avgjort,
        // så «behandler» gjelder også på betalte arrangementer.
        case "pending":
            return "processing";
        default: {
            if (event.closed === true) return "closed";
            if (event.end_date && new Date(event.end_date) < now) return "closed";
            if (
                event.end_registration_at &&
                new Date(event.end_registration_at) < now
            ) {
                return "closed";
            }
            if (
                event.start_registration_at &&
                new Date(event.start_registration_at) > now
            ) {
                return "not-open";
            }
            // Sist av alle grensene: at plassene er tatt betyr ingenting så
            // lenge påmeldingen er stengt eller ikke åpnet — da er det det som
            // skal stå.
            const capacity = event.limit ?? 0;
            const registered = Number(event.list_count ?? 0);
            if (capacity > 0 && registered >= capacity) return "full";
            return "open";
        }
    }
}

/**
 * «9:32», «0:14» — tida igjen på en frist som løper mens medlemmet ser på.
 *
 * Betalingsfristen er kort, så en frist på klokka sier lite: sekundene er hele
 * poenget med at den teller ned. Over en time er den grove teksten bedre —
 * «58:12» sier mindre enn «snart en time».
 *
 * Returnerer `null` når fristen er passert.
 */
export function formatCountdown(
    iso: string,
    now: Date = new Date(),
): string | null {
    const remainingMs = new Date(iso).getTime() - now.getTime();
    if (Number.isNaN(remainingMs) || remainingMs <= 0) return null;

    if (remainingMs >= 60 * 60 * 1000) {
        const hours = Math.round(remainingMs / (60 * 60 * 1000));
        return hours === 1 ? "en time" : `${hours} timer`;
    }

    // Rundes opp: med 200 ms igjen står det «0:01», ikke «0:00» — det siste
    // ville sagt at fristen var ute mens den fortsatt løp.
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * «2 dager», «3 timer», «34 sekunder» — halen på «Påmelding åpner om …».
 *
 * Grov med vilje: for noe som åpner om dager sier sekunder ingenting. Ledd som
 * er null tas bort, så det aldri står «0 timer, 0 minutter og 41 sekunder».
 */
export function formatTimeUntil(iso: string, now: Date = new Date()): string {
    const ms = new Date(iso).getTime() - now.getTime();
    if (Number.isNaN(ms) || ms <= 0) return "et øyeblikk";

    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    if (days >= 2) return `${days} dager`;

    const hours = Math.floor(ms / (60 * 60 * 1000));
    if (hours >= 1) return hours === 1 ? "en time" : `${hours} timer`;

    const minutes = Math.floor(ms / (60 * 1000));
    if (minutes >= 1) return minutes === 1 ? "ett minutt" : `${minutes} minutter`;

    const seconds = Math.max(1, Math.ceil(ms / 1000));
    return seconds === 1 ? "ett sekund" : `${seconds} sekunder`;
}

/**
 * Oversett en feil fra påmeldings- eller betalingsendepunktet til noe et
 * medlem forstår.
 *
 * Photons meldinger er engelske og skrevet for utviklere. De vanligste
 * årsakene får en norsk forklaring; resten faller tilbake på API-meldingen,
 * som fortsatt er bedre enn ingenting. Her havner også avvisningene som
 * forteller at arrangementet ikke er for deg — prioriterte grupper, institutt
 * eller manglende rettighet.
 */
export function registrationErrorMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("not open for registration")) {
        return "Dette arrangementet er ikke åpent for påmelding.";
    }
    // Photon svarer dette så lenge det ligger en påmeldingsrad på deg, også
    // når den er avbrutt — da er «du er påmeldt» direkte feil.
    if (message.includes("already registered")) {
        return "Du har allerede en påmelding på dette arrangementet. Dra ned for å oppdatere.";
    }
    if (message.includes("accept the event rules")) {
        return "Du må godkjenne arrangementsreglene før du kan melde deg på. Huk av i varselet over.";
    }
    if (message.includes("priority pool")) {
        return "Dette arrangementet er forbeholdt medlemmer i en prioritert gruppe.";
    }
    if (message.includes("only open to students at")) {
        const institute = message.split("only open to students at")[1]?.trim();
        return institute
            ? `Dette arrangementet er kun for studenter ved ${institute}.`
            : "Dette arrangementet er kun for studenter ved ett bestemt institutt.";
    }
    if (message.includes("requires permission")) {
        return "Kontoen din har ikke tilgang til å melde seg på arrangementer. Ta kontakt med Index hvis dette ser feil ut.";
    }
    if (message.includes("Authentication required")) {
        return "Du må være innlogget for å melde deg på.";
    }
    if (message.includes("not registered")) {
        return "Du er ikke påmeldt dette arrangementet.";
    }
    if (message.includes("pending payment already exists")) {
        return "Du har allerede en betaling på gang i Vipps. Fullfør den der, eller vent et minutt og prøv igjen.";
    }
    if (message.includes("already paid")) {
        return "Plassen er allerede betalt. Dra ned for å oppdatere.";
    }
    if (message.includes("register for the event before paying")) {
        return "Du må ha en plass på arrangementet før du kan betale.";
    }
    if (message.includes("does not require payment")) {
        return "Dette arrangementet krever ingen betaling.";
    }
    if (message.includes("Failed to initiate Vipps payment")) {
        return "Vipps svarte ikke. Prøv igjen om litt — plassen din står så lenge fristen ikke har gått ut.";
    }

    return message;
}
