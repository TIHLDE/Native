import { apiFetch, apiJson } from "@/lib/api/client";
import { API_URL } from "@/actions/constant";
import { getToken } from "@/lib/storage/tokenStore";
import { Event, JobPost } from "../types";
import { PhotonEvent, toEvent, toJobTypeKey } from "@/actions/photon";

type PhotonEventList = { items: PhotonEvent[]; totalCount: number; nextPage: number | null };

/**
 * Arrangementslista. Åpne data, så den går uten token — men gjennom samme
 * base-URL som resten, slik at bare ett sted peker på API-et.
 *
 * Photon ignorerer ukjente query-parametre i stillhet, så et feilstavet filter
 * ser ut til å virke mens det ikke gjør noe. Navnene her må stemme med
 * `/api/event` i https://photon.tihlde.org/openapi.
 */
export async function fetchEvents(params?: URLSearchParams): Promise<{ results: Event[]; next: string | null }> {
    const query = params ? `?${params}` : "";
    const response = await fetch(`${API_URL}/event${query}`);

    if (!response.ok) {
        throw new Error(`Kunne ikke hente arrangementer (${response.status})`);
    }

    const data = (await response.json()) as PhotonEventList;
    return {
        results: data.items.map((event) => toEvent(event)),
        next: data.nextPage !== null ? String(data.nextPage) : null,
    };
}

/** Det Photon gir oss om et favorittmerket arrangement. */
type PhotonFavoriteEvent = {
    eventId: string;
    title: string;
    slug: string;
    startTime: string;
    endTime: string;
    createdAt: string;
};

/**
 * Favorittmerkede arrangementer.
 *
 * Photon har ingen favoritt-parameter på arrangementslista, bare et eget
 * endepunkt — og det svarer med en tynn form uten bilde, arrangør eller sted,
 * så hvert arrangement må hentes for seg for å kunne vises som kort.
 *
 * Lista er ikke paginert hos Photon, og favoritter er få nok til at alt
 * hentes i én omgang. Søk og tidligere/kommende filtreres derfor her.
 */
export async function fetchFavoriteEvents(options: {
    search?: string;
    expired: boolean;
}): Promise<{ results: Event[]; next: string | null }> {
    const favorites = await apiJson<PhotonFavoriteEvent[]>("/event/favorite");

    const now = Date.now();
    const search = options.search?.trim().toLowerCase();

    const wanted = favorites.filter((favorite) => {
        const isOver = new Date(favorite.endTime).getTime() < now;
        if (isOver !== options.expired) return false;
        return !search || favorite.title.toLowerCase().includes(search);
    });

    // Ett oppslag per favoritt. Faller et enkelt bort — slettet arrangement,
    // eller et man ikke lenger har tilgang til — utelates det i stedet for at
    // hele lista feiler.
    const events = await Promise.all(
        wanted.map((favorite) => fetchEvent(favorite.eventId).catch(() => null)),
    );

    const results = events.filter((event): event is Event => event !== null);
    results.sort((a, b) => {
        const left = new Date(a.start_date).getTime();
        const right = new Date(b.start_date).getTime();
        // Kommende: det som skjer først øverst. Tidligere: sist avholdte først.
        return options.expired ? right - left : left - right;
    });

    return { results, next: null };
}

/**
 * Ett arrangement.
 *
 * Åpent endepunkt, så det virker uten token — men Photon legger innloggedes
 * egen påmelding på arrangementet, og bare når kallet er autentisert. Uten
 * token er `registration` alltid borte, og skjermen vet ikke om du står på
 * lista. Derfor: token når vi har en, vanlig fetch ellers.
 */
export async function fetchEvent(eventId: string): Promise<Event> {
    const path = `/event/${encodeURIComponent(eventId)}`;
    const token = await getToken();

    const response = token
        ? await apiFetch(path)
        : await fetch(`${API_URL}${path}`);

    if (!response.ok) {
        throw new Error(`Kunne ikke hente arrangementet (${response.status})`);
    }

    return toEvent((await response.json()) as PhotonEvent);
}

export type EventCounts = {
    listCount: number;
    /** Null når vi ikke har lov til å vite det. */
    waitingListCount: number | null;
};

/**
 * Antall påmeldte og på venteliste.
 *
 * Photon legger ikke tallene på selve arrangementet, slik Lepton gjorde — de
 * kommer fra `totalCount` på påmeldingslista, som er det nettsiden bruker også.
 * Én rad hentes bare for å få tellingen.
 *
 * Ventelista krever at man administrerer arrangementet, siden det er en
 * statusfiltrering. For alle andre er tallet ukjent, ikke null.
 */
export async function fetchEventCounts(eventId: string): Promise<EventCounts> {
    const path = `/event/${encodeURIComponent(eventId)}/registration?pageSize=1`;

    const [registered, waitlisted] = await Promise.all([
        apiJson<{ totalCount: number }>(path),
        apiJson<{ totalCount: number }>(`${path}&status=waitlisted`).catch(
            () => null,
        ),
    ]);

    return {
        listCount: registered.totalCount,
        waitingListCount: waitlisted?.totalCount ?? null,
    };
}

type PhotonJobPost = {
    id: string;
    title: string;
    company: string;
    location: string;
    body: string;
    ingress: string;
    jobType: string;
    classStart: string;
    classEnd: string;
    deadline: string | null;
    email: string | null;
    link: string | null;
    imageUrl: string | null;
    expired: boolean;
};

const toJobPost = (job: PhotonJobPost): JobPost => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    body: job.body,
    ingress: job.ingress,
    job_type: toJobTypeKey(job.jobType),
    class_start: job.classStart,
    class_end: job.classEnd,
    deadline: job.deadline,
    email: job.email,
    link: job.link,
    image: job.imageUrl,
    expired: job.expired,
});

/** Stillingsannonser. Åpne data, samme mønster. */
export async function fetchJobPosts(): Promise<{ results: JobPost[] }> {
    const response = await fetch(`${API_URL}/jobs`);
    if (!response.ok) throw new Error(`Kunne ikke hente annonser (${response.status})`);
    const data = await response.json();
    const items: PhotonJobPost[] = Array.isArray(data) ? data : (data.items ?? []);
    return { results: items.map(toJobPost) };
}

export async function fetchJobPost(id: string): Promise<JobPost> {
    const response = await fetch(`${API_URL}/jobs/${encodeURIComponent(id)}`);
    if (!response.ok) throw new Error(`Kunne ikke hente annonsen (${response.status})`);
    return toJobPost((await response.json()) as PhotonJobPost);
}
