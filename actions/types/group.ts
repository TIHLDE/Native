
export type Group = {
    finesActivated?: boolean;
    image?: string;
    imageAlt?: string;
    name: string;
    slug: string;
    type: string;
    description?: string;
    contactEmail?: string;
    /**
     * Hva gruppa kaller lederen sin, f.eks. «Teknologiminister». Null betyr
     * vanlig «Leder». Bare `GET /groups/:slug` svarer med den — ikke
     * `/groups/mine` — så den er tom for grupper som er lest fra medlemskapene.
     */
    leaderTitle?: string | null;
    /** Markdown om hvordan gruppa praktiserer bøtesystemet. */
    finesInfo?: string;
}
