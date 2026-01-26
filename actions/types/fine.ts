import { User } from "./user";

export type GroupLaw = {
    id: string;
    title: string;
    paragraph: string;
    description: string;
    amount: number;
};

export type GroupFine = {
    id: string;
    user: User;
    amount: number;
    approved: boolean;
    payed: boolean;
    description: string;
    reason: string;
    defense: string;
    image: string | null;
    created_by: User;
    created_at: string;
    starred: boolean;
};

export type GroupFineCreate = {
    user: string[]; // Array of user IDs
    amount: number;
    description: string;
    reason: string;
    image?: string | null;
};
