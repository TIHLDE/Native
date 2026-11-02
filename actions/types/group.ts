
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
    /**
     * Om den innloggede kan se og gi bøter i gruppa. Photon svarer for
     * innloggeren, fordi `finesActivated` alene ikke sier det: en som ikke er
     * medlem får 403 på både bøtene og lovverket. Bare `GET /groups/:slug`
     * har feltet, så det er udefinert for grupper lest fra listene.
     */
    viewerCanUseFines?: boolean;
}

/** En gruppe i oversikten over alle grupper, `GET /groups`. */
export type GroupListItem = Group & {
    memberCount: number;
};
