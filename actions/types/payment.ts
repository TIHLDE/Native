import { User } from "./user";

export type Payment = {
    order_id: string;
    status: string;
    user: User;
    payment_link: string;
    event: {
        id: number;
        title: string;
        image: string;
        start_date: string;
        end_date: string;
    }
}