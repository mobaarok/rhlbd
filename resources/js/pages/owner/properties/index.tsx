import { Head, Link, usePage } from '@inertiajs/react';
import { ExternalLink, Eye, Pencil, Plus, XCircle } from 'lucide-react';
import { DeleteButton } from '@/components/admin/delete-button';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { formatNumber, formatPrice } from '@/lib/format';
import owner from '@/routes/owner';
import { show } from '@/routes/properties';
import type { PropertyStatus } from '@/types';

type Row = {
    id: number;
    slug: string;
    title: string;
    cover_url: string | null;
    area: string;
    listing_type: 'rent' | 'sale';
    status: PropertyStatus;
    rejection_reason: string | null;
    price: number;
    price_suffix: string;
    views: number;
};

type Props = {
    properties: Row[];
};

/**
 * "My properties" ( /my-properties ): the property owner's home page.
 * Lists their listings with the review status (pending / published / rejected).
 * Data comes from app/Http/Controllers/Owner/PropertyController.php
 */
export default function OwnerPropertiesIndex({ properties }: Props) {
    const { auth, site } = usePage().props;

    return (
        <>
            <Head title="My properties" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title={`Hello, ${auth.user?.name.split(' ')[0]} 👋`}
                    description="Your listings and their review status. Every new or edited listing is checked by our team before it goes live."
                    actions={
                        <Button asChild>
                            <Link href={owner.properties.create()}>
                                <Plus className="size-4" /> Post a property
                            </Link>
                        </Button>
                    }
                />

                {properties.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed p-10 text-center">
                        <p className="text-muted-foreground">
                            You haven't posted any properties yet.
                        </p>
                        <Button asChild>
                            <Link href={owner.properties.create()}>
                                <Plus className="size-4" /> Post your first
                                property
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {properties.map((property) => (
                            <div
                                key={property.id}
                                className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center"
                            >
                                {property.cover_url ? (
                                    <img
                                        src={property.cover_url}
                                        alt=""
                                        className="aspect-video w-full shrink-0 rounded-lg object-cover sm:aspect-square sm:size-20"
                                    />
                                ) : (
                                    <div className="hidden size-20 shrink-0 rounded-lg bg-muted sm:block" />
                                )}

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Link
                                            href={owner.properties.edit(
                                                property.slug,
                                            )}
                                            className="font-semibold hover:underline"
                                        >
                                            {property.title}
                                        </Link>
                                        <StatusBadge status={property.status} />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {property.area} ·{' '}
                                        {property.listing_type === 'rent'
                                            ? 'For rent'
                                            : 'For sale'}{' '}
                                        · {formatPrice(property.price)}{' '}
                                        {property.price_suffix}
                                        {property.status === 'published' && (
                                            <span className="ml-2 inline-flex items-center gap-1">
                                                <Eye className="size-3.5" />
                                                {formatNumber(
                                                    property.views,
                                                )}{' '}
                                                views
                                            </span>
                                        )}
                                    </p>
                                    {property.status === 'rejected' &&
                                        property.rejection_reason && (
                                            <p className="mt-1 flex gap-1.5 text-sm text-destructive">
                                                <XCircle className="mt-0.5 size-4 shrink-0" />
                                                {property.rejection_reason}
                                            </p>
                                        )}
                                </div>

                                <div className="flex shrink-0 gap-1">
                                    <Button
                                        asChild
                                        variant="ghost"
                                        size="icon"
                                        aria-label={
                                            property.status === 'published'
                                                ? 'View on website'
                                                : 'Preview'
                                        }
                                    >
                                        <a
                                            href={show.url(property.slug)}
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
                                            href={owner.properties.edit(
                                                property.slug,
                                            )}
                                        >
                                            <Pencil className="size-4" />
                                        </Link>
                                    </Button>
                                    <DeleteButton
                                        url={owner.properties.destroy.url(
                                            property.slug,
                                        )}
                                        itemName={property.title}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-sm text-muted-foreground">
                    Questions? Call us on{' '}
                    <a href={`tel:${site.phone}`} className="underline">
                        {site.phone}
                    </a>
                    .
                </p>
            </div>
        </>
    );
}

OwnerPropertiesIndex.layout = {
    breadcrumbs: [{ title: 'My properties', href: owner.properties.index() }],
};
