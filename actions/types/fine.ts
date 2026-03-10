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
