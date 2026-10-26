import { Group } from "./group";

export type User = {
    userId: string;
    firstName: string;
    lastName: string;
    image?: string;
    email: string;
    gender: number;
    study: {
        group: Group;
    }
    studyyear: {
        group: Group;
    },
    /**
     * Klassetrinnet slik Photon regner det: første år på master er 4. klasse,
     * og det er null for alumni og for den som ikke kan plasseres.
     */
    classYear: number | null;
    unansweredEvaluationsCount: number,
}

/** En gruppe på profilen til et medlem. */
export type ProfileGroup = {
    slug: string;
    name: string;
    type: string;
};

/**
 * Det ett medlem kan se om et annet — `GET /user/:id`. Kjønn, allergier og
 * varslingsinnstillinger hører til sesjonen og er ikke med.
 */
export type UserProfile = {
    id: string;
    username: string | null;
    name: string;
    image: string | null;
    /** Bare satt på egen profil og for en admin med `users:view`. */
    email: string | null;
    bio: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
    studyProgram: string | null;
    classYear: number | null;
    /** Ekte medlemskap, uten TIHLDE, studieprogrammet og kullet. */
    groups: ProfileGroup[];
};

type PermissionTypes = {
    read: boolean;
    write: boolean;
    destroy?: boolean;
    update?: boolean;
    retrieve?: boolean;
    /** Om brukeren kan melde seg på. Alumni kan lese, men ikke melde seg på. */
    register?: boolean;
}

export type Permissions = {
    album: PermissionTypes;
    badgecategory: PermissionTypes;
    banner: PermissionTypes;
    bookableitem: PermissionTypes;
    bug: PermissionTypes;
    category: PermissionTypes;
    cheatsheet: PermissionTypes;
    codexevent: PermissionTypes;
    codexeventregistration: PermissionTypes;
    event: PermissionTypes;
    eventform: PermissionTypes;
    feedback: PermissionTypes;
    file: PermissionTypes;
    fine: PermissionTypes;
    form: PermissionTypes;
    group: PermissionTypes;
    groupform: PermissionTypes;
    idea: PermissionTypes;
    jobpost: PermissionTypes;
    law: PermissionTypes;
    membership: PermissionTypes;
    membershiphistory: PermissionTypes;
    minute: PermissionTypes;
    news: PermissionTypes;
    notification: PermissionTypes;
    order: PermissionTypes;
    page: PermissionTypes;
    picture: PermissionTypes;
    qrcode: PermissionTypes;
    reaction: PermissionTypes;
    registration: PermissionTypes;
    reservation: PermissionTypes;
    shortlink: PermissionTypes;
    strike: PermissionTypes;
    strikesoverview: PermissionTypes;
    submission: PermissionTypes;
    toddel: PermissionTypes;
    user: PermissionTypes;
    userbadge: PermissionTypes;
    userbio: PermissionTypes;
    usergallery: PermissionTypes;
    usernotificationsettings: PermissionTypes;
    warning: PermissionTypes;
    weeklybusiness: PermissionTypes;
}