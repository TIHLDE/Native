import { apiJson } from "@/lib/api/client";
import { API_URL } from "@/actions/constant";
import { Event, JobPost } from "../types";
import { PhotonEvent, toEvent } from "@/actions/photon";

type PhotonEventList = { items: PhotonEvent[]; totalCount: number; nextPage: number | null };

/**
 * Arrangementslista. Åpne data, så den går uten token — men gjennom samme
 * base-URL som resten, slik at bare ett sted peker på API-et.
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

export async function fetchEvent(eventId: string): Promise<Event> {
    const response = await fetch(`${API_URL}/event/${encodeURIComponent(eventId)}`);

    if (!response.ok) {
        throw new Error(`Kunne ikke hente arrangementet (${response.status})`);
    }

    return toEvent((await response.json()) as PhotonEvent);
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
    job_type: job.jobType,
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
