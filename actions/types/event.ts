
export type Event = {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    location?: string;
    description?: string;
    image?: string;
    category?: {
        id: number;
        text: string;
    };
    organizer?: {
        name: string;
        slug: string;
    };
    contact_person?: {
        first_name: string;
        last_name: string;
    };
    paid_information: {
        price: string;
    };
    limit: number;
    list_count: string;
    waiting_list_count: string;
    sign_off_deadline: string;
    end_registration_at: string;
    start_registration_at: string;
    sign_up?: boolean;
};