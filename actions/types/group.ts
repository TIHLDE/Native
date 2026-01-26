
export type Group = {
    fines_activated?: boolean;
    fines_admin?: { user_id: string } | null;
    image?: string;
    image_alt?: string;
    name: string;
    slug: string;
    type: string;
    viewer_is_member: boolean;
    membership_type: string;
    permissions?: {
        write: boolean;
    };
}