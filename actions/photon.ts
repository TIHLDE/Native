/**
 * Oversettelse mellom Photons former og de appen allerede bruker.
 *
 * Skjermene ble skrevet mot Leptons snake_case. Photon svarer i camelCase med
 * andre navn og delvis annen struktur, men å endre 13 skjermfiler ville gjort
 * migrasjonen mye større og vanskeligere å verifisere. Oversettelsen ligger
 * derfor her, i ett lag, og skjermene er urørt.
 */
import type {
    Event,
    GroupUser,
    Law,
    Membership,
    Notification,
    User,
} from "@/actions/types";

export type PhotonUser = {
    id: string;
    name?: string | null;
    username?: string | null;
    email?: string | null;
    image?: string | null;
    studyProgram?: string | null;
    studyStartYear?: number | null;
};

/**
 * Photon returnerer ett visningsnavn. Å dele det i fornavn og etternavn gjetter
 * feil på alle med to fornavn eller sammensatt etternavn, så resten av navnet
 * legges i etternavnet framfor å bli borte.
 */
export const splitName = (name?: string | null) => {
    const [first, ...rest] = (name ?? "").trim().split(/\s+/);
    return { first_name: first ?? "", last_name: rest.join(" ") };
};

export const toUser = (user: PhotonUser | null | undefined): User =>
    ({
        ...splitName(user?.name),
        // Brukernavnet er nøkkelen appen viser og sammenligner på; Photons
        // interne id brukes bare når brukernavnet mangler.
        user_id: user?.username ?? user?.id ?? "",
        email: user?.email ?? "",
        image: user?.image ?? undefined,
        gender: 0,
        study: { group: { name: user?.studyProgram ?? "", slug: "" } },
        studyyear: { group: { name: String(user?.studyStartYear ?? ""), slug: "" } },
        unanswered_evaluations_count: 0,
    }) as unknown as User;

export const toGroupUser = (user: PhotonUser | null | undefined): GroupUser => ({
    ...splitName(user?.name),
    user_id: user?.username ?? user?.id ?? "",
    email: user?.email ?? "",
    image: user?.image ?? undefined,
    gender: 0,
});

export type PhotonGroup = {
    slug: string;
    name: string;
    logoUrl?: string | null;
    imageUrl?: string | null;
    contactEmail?: string | null;
    description?: string | null;
    type?: string;
    finesActivated?: boolean;
    membership?: { role: "member" | "leader"; joinedAt?: string } | null;
};

/**
 * `logoUrl` er den kvadratiske merket Leptons `image` holdt. `imageUrl` er en
 * bred banner og ville sprengt avatar-oppsettet.
 */
export const toGroup = (group: PhotonGroup) =>
    ({
        name: group.name,
        slug: group.slug,
        image: group.logoUrl ?? undefined,
        contact_email: group.contactEmail ?? undefined,
        description: group.description ?? undefined,
        type: group.type,
        fines_activated: group.finesActivated ?? false,
    }) as unknown as Membership["group"];

export const toMembership = (group: PhotonGroup): Membership => ({
    created_at: group.membership?.joinedAt ?? "",
    expiration_date: null,
    group: toGroup(group),
    membership_type: group.membership?.role === "leader" ? "LEADER" : "MEMBER",
    user: toUser(null),
});

export type PhotonLaw = {
    id: string;
    amount: number;
    description: string;
    paragraph: string;
    title: string;
};

export const toLaw = (law: PhotonLaw): Law => ({
    id: law.id,
    amount: law.amount,
    description: law.description,
    paragraph: law.paragraph,
    title: law.title,
});

export type PhotonEvent = {
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    location?: string | null;
    startTime: string;
    endTime: string;
    registrationStart?: string | null;
    registrationEnd?: string | null;
    cancellationDeadline?: string | null;
    image?: string | null;
    capacity?: number | null;
    requiresSigningUp?: boolean;
    category?: { slug: string; label: string } | null;
    organizer?: { name: string; slug: string } | null;
    contactPerson?: { name?: string | null } | null;
    payInfo?: { price?: number | null } | null;
};

/**
 * Photon holder ikke påmeldingstall på arrangementet slik Lepton gjorde.
 * `listCount` og `waitingListCount` sendes inn av kalleren der de er kjent, og
 * står som "0" ellers — skjermene viser dem som tekst.
 */
export const toEvent = (
    event: PhotonEvent,
    counts?: { listCount?: number; waitingListCount?: number },
): Event =>
    ({
        id: event.id,
        title: event.title,
        start_date: event.startTime,
        end_date: event.endTime,
        location: event.location ?? undefined,
        description: event.description ?? undefined,
        image: event.image ?? undefined,
        category: event.category
            ? { id: 0, text: event.category.label }
            : undefined,
        organizer: event.organizer ?? undefined,
        contact_person: event.contactPerson
            ? splitName(event.contactPerson.name)
            : undefined,
        paid_information: { price: String(event.payInfo?.price ?? "") },
        limit: event.capacity ?? 0,
        list_count: String(counts?.listCount ?? 0),
        waiting_list_count: String(counts?.waitingListCount ?? 0),
        sign_off_deadline: event.cancellationDeadline ?? "",
        end_registration_at: event.registrationEnd ?? "",
        start_registration_at: event.registrationStart ?? "",
        sign_up: event.requiresSigningUp ?? false,
    }) as unknown as Event;

export type PhotonRegisteredUser = {
    id: string;
    name: string;
    email: string;
    image: string | null;
    status: string;
    waitlistPosition: number | null;
    attendedAt: string | null;
    registeredAt: string;
    payment: unknown | null;
};

/**
 * Photon har én status per påmelding der Lepton hadde `is_on_wait` som eget
 * flagg. Ventelisteplassen er nullbar, og 0 er en gyldig plass, så den kan
 * ikke brukes til å avgjøre om noen står på venteliste.
 */
export const toRegistration = (registered: PhotonRegisteredUser) =>
    ({
        has_attended: registered.attendedAt !== null,
        has_paid_order: registered.payment !== null,
        has_unanswered_evaluation: false,
        is_on_wait: registered.status === "waitlist",
        payment_expiredate: "",
        payment_orders: [],
        wait_queue_number: registered.waitlistPosition ?? 0,
        registration_id: registered.id,
        user_info: toUser({
            id: registered.id,
            name: registered.name,
            email: registered.email,
            image: registered.image,
        }),
    }) as unknown as import("@/actions/types").Registration;

/**
 * Photon navngir stillingstypene med små bokstaver og understrek
 * (`full_time`), Lepton med store (`FULL_TIME`). Skjermene slår opp i den
 * gamle tabellen, så oversettelsen hører hjemme her — uten den ble
 * «Stillingstype» stående tom.
 */
export const toJobTypeKey = (jobType: string): string =>
    jobType.toUpperCase();

const CLASS_NUMBERS: Record<string, string> = {
    first: "1",
    second: "2",
    third: "3",
    fourth: "4",
    fifth: "5",
};

/**
 * «1. – 5. trinn» av Photons `first`/`fifth`.
 *
 * Alumni er ikke et trinn og har ikke noe tall, så den skrives ut som seg
 * selv framfor å bli presset inn i rekkefølgen.
 */
export const classRangeLabel = (start: string, end: string): string => {
    const from = CLASS_NUMBERS[start];
    const to = CLASS_NUMBERS[end];

    if (from && to) return `${from}. – ${to}. trinn`;
    if (from && end === "alumni") return `${from}. trinn – alumni`;
    if (start === "alumni") return "Alumni";
    return "";
};

export type PhotonNotification = {
    id: string;
    title: string;
    description: string;
    link?: string | null;
    isRead: boolean;
    createdAt: string;
};

/**
 * Varsler har ingen Lepton-form å oversette til — feltene er Photons egne.
 * Kartleggingen ligger her likevel, sånn at skjermene fortsatt bare kjenner
 * `Notification` og ikke svarformen fra API-et.
 */
export const toNotification = (
    notification: PhotonNotification,
): Notification => ({
    id: notification.id,
    title: notification.title,
    description: notification.description,
    link: notification.link ?? null,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
});
