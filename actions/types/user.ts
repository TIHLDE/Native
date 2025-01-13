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
    }
}