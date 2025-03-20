import { User } from "./user";

export type Registration = {
    has_attended: boolean;
    has_paid_order: boolean;
    has_unanswered_evaluation: boolean;
    is_on_wait: boolean;
    payment_expiredate: string;
    payment_orders: string[];
    wait_queue_number: number;
    registration_id: number;
    user_info: User;
}