/**
 * TypeScript shapes of the data the Laravel backend sends to React pages.
 *
 * Keep these in sync with:
 *  - app/Http/Resources/PropertyCardResource.php   -> PropertyCard
 *  - app/Http/Resources/PropertyDetailResource.php -> PropertyDetail
 *  - config/site.php                               -> SiteSettings
 */

export type ListingType = 'rent' | 'sale';

/** See app/Enums/PropertyStatus.php (pending/rejected = owner submissions under review) */
export type PropertyStatus =
    | 'pending'
    | 'published'
    | 'rejected'
    | 'draft'
    | 'rented'
    | 'sold';

/** Small property object used on cards and grids. */
export type PropertyCard = {
    id: number;
    slug: string;
    title: string;
    listing_type: ListingType;
    listing_label: string;
    status: PropertyStatus;
    is_featured: boolean;
    price: number;
    price_suffix: string;
    bedrooms: number;
    bathrooms: number;
    parking: number;
    size_sqft: number;
    cover_url: string | null;
    area: { name: string; slug: string; city: string };
    category: { name: string; slug: string };
};

/** Full property object used on the detail page. */
export type PropertyDetail = PropertyCard & {
    code: string | null;
    floor: number | null;
    building_name: string | null;
    address: string;
    map_embed_url: string | null;
    description: string;
    nearby: { name: string; distance: string }[];
    contact_name: string | null;
    contact_phone: string | null;
    views: number;
    listed_at: string;
    images: { id: number; url: string }[];
    features: { id: number; name: string; icon: string | null }[];
};

export type Area = {
    id: number;
    name: string;
    slug: string;
    city: string;
    image: string | null;
    description: string | null;
    is_popular: boolean;
    properties_count?: number;
};

export type Category = {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    description: string | null;
    sort_order: number;
    properties_count?: number;
};

export type Feature = {
    id: number;
    name: string;
    icon: string | null;
    properties_count?: number;
};

/** A simple {value, label} pair used for <select> options. */
export type Option = { value: string; label: string };

/** Business contact details from config/site.php (shared on every page). */
export type SiteSettings = {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    /** Social media page URLs (null = not set yet) */
    social: {
        facebook: string | null;
        instagram: string | null;
        youtube: string | null;
        linkedin: string | null;
    };
    currency: string;
};

/** One link in Laravel's pagination ("« Previous", "1", "2", "Next »"). */
export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

/**
 * A page of results from a Laravel API Resource collection:
 * PropertyCardResource::collection($paginator)
 */
export type ResourcePage<T> = {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
        per_page: number;
        links: PaginationLink[];
    };
};

/**
 * A page of results from a plain Laravel paginator: Model::paginate(20)
 */
export type Paginator<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
};

/** A non-paginated API Resource collection is wrapped in { data: [...] }. */
export type ResourceList<T> = { data: T[] };
