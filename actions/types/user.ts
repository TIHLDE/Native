import { Group } from "./group";

export type User = {
    user_id: string;
    first_name: string;
    last_name: string;
    image?: string;
    email: string;
    gender: number;
    study: {
        group: Group;
    }
    studyyear: {
        group: Group;
    },
    unanswered_evaluations_count: number,
}

type PermissionTypes = {
    read: boolean;
    write: boolean;
    destroy?: boolean;
    update?: boolean;
    retrieve?: boolean;
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