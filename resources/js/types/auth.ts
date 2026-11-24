/**
 * A logged-in person: either the site admin (is_admin = true)
 * or a property owner who registered to post their properties.
 */
export type User = {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    /** true = can open the admin panel */
    is_admin: boolean;
    avatar?: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    /** null when nobody is logged in */
    user: User | null;
};
