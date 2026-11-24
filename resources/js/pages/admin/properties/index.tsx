import { Head, Link, router } from '@inertiajs/react';
import {
    Clock,
    ExternalLink,
    Pencil,
    Plus,
    Star,
    UserRound,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DeleteButton } from '@/components/admin/delete-button';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { Pagination } from '@/components/site/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { formatNumber, formatPrice } from '@/lib/format';
import admin from '@/routes/admin';
import { show } from '@/routes/properties';
import type { Option, Paginator, PropertyStatus } from '@/types';

type Row = {
    id: number;
    slug: string;
    title: string;
    code: string | null;
    cover_url: string | null;
    area: string;
    category: string;
    listing_type: 'rent' | 'sale';
    status: PropertyStatus;
    is_featured: boolean;
    price: number;
    price_suffix: string;
    views: number;
    /** Owner who submitted it (null = added by the admin) */
    owner: string | null;
};

type Props = {
    properties: Paginator<Row>;
    filters: { search: string; status: string };
    statuses: Option[];
    /** Owner submissions waiting for review */
    pendingCount: number;
};

/**
 * Admin list of all properties ( /admin/properties ).
 * Listings posted by property owners show "Posted by …"; the amber button
 * filters the list to submissions waiting for review.
 */
export default function AdminPropertiesIndex({
    properties,
    filters,
    statuses,
    pendingCount,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const isFirstRender = useRef(true);

    /** Reload the table with new filters (keeps the URL in sync). */
    const applyFilters = (next: Partial<Props['filters']>) => {
        const query = Object.fromEntries(
            Object.entries({ ...filters, ...next }).filter(
                ([, value]) => value,
            ),
        );
        router.get(admin.properties.index.url(), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Search after the admin stops typing for 400ms
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        const timer = setTimeout(() => applyFilters({ search }), 400);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    return (
        <>
            <Head title="Properties" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Properties"
                    description={`${properties.total} listings in total`}
                    actions={
                        <>
                            {pendingCount > 0 && (
                                <Button
                                    variant="outline"
                                    className="border-amber-300 text-amber-800 dark:text-amber-300"
                                    onClick={() =>
                                        applyFilters({ status: 'pending' })
                                    }
                                >
                                    <Clock className="size-4" /> {pendingCount}{' '}
                                    waiting for review
                                </Button>
                            )}
                            <Button asChild>
                                <Link href={admin.properties.create()}>
                                    <Plus className="size-4" /> Add property
                                </Link>
                            </Button>
                        </>
                    }
                />

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                        type="search"
                        placeholder="Search by title or code…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="sm:max-w-xs"
                    />
                    <NativeSelect
                        aria-label="Filter by status"
                        value={filters.status}
                        onChange={(e) =>
                            applyFilters({ status: e.target.value })
                        }
                        className="sm:w-44"
                    >
                        <option value="">All statuses</option>
                        {statuses.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </NativeSelect>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border bg-card">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                            <tr>
                                <th className="p-3">Property</th>
                                <th className="p-3">Area</th>
                                <th className="p-3">Price</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Views</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {properties.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="p-8 text-center text-muted-foreground"
                                    >
                                        No properties found.
                                    </td>
                                </tr>
                            )}
                            {properties.data.map((property) => (
                                <tr
                                    key={property.id}
                                    className="hover:bg-muted/30"
                                >
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            {property.cover_url ? (
                                                <img
                                                    src={property.cover_url}
                                                    alt=""
                                                    className="size-12 shrink-0 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="size-12 shrink-0 rounded-lg bg-muted" />
                                            )}
                                            <div className="min-w-0">
                                                <Link
                                                    href={admin.properties.edit(
                                                        property.slug,
                                                    )}
                                                    className="flex items-center gap-1 font-medium hover:underline"
                                                >
                                                    {property.is_featured && (
                                                        <Star className="size-3.5 fill-gold text-gold" />
                                                    )}
                                                    <span className="truncate">
                                                        {property.title}
                                                    </span>
                                                </Link>
                                                <p className="text-xs text-muted-foreground">
                                                    {property.code ?? 'No code'}{' '}
                                                    · {property.category} ·{' '}
                                                    {property.listing_type ===
                                                    'rent'
                                                        ? 'Rent'
                                                        : 'Sale'}
                                                </p>
                                                {property.owner && (
                                                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <UserRound className="size-3" />
                                                        Posted by{' '}
                                                        {property.owner}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 whitespace-nowrap">
                                        {property.area}
                                    </td>
                                    <td className="p-3 whitespace-nowrap">
                                        {formatPrice(property.price)}
                                        <span className="text-muted-foreground">
                                            {' '}
                                            {property.price_suffix}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <StatusBadge status={property.status} />
                                    </td>
                                    <td className="p-3 text-right">
                                        {formatNumber(property.views)}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="icon"
                                                aria-label="View on website"
                                            >
                                                <a
                                                    href={show.url(
                                                        property.slug,
                                                    )}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <ExternalLink className="size-4" />
                                                </a>
                                            </Button>
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="icon"
                                                aria-label="Edit"
                                            >
                                                <Link
                                                    href={admin.properties.edit(
                                                        property.slug,
                                                    )}
                                                >
                                                    <Pencil className="size-4" />
                                                </Link>
                                            </Button>
                                            <DeleteButton
                                                url={admin.properties.destroy.url(
                                                    property.slug,
                                                )}
                                                itemName={property.title}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination links={properties.links} />
            </div>
        </>
    );
}

AdminPropertiesIndex.layout = {
    breadcrumbs: [{ title: 'Properties', href: admin.properties.index() }],
};
