import { Link } from '@inertiajs/react';
import { Bath, BedDouble, Car, MapPin, Maximize } from 'lucide-react';
import { FavoriteButton } from '@/components/site/favorite-button';
import { formatNumber, formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { show } from '@/routes/properties';
import type { PropertyCard as PropertyCardType } from '@/types';

type Props = {
    property: PropertyCardType;
    className?: string;
};

/**
 * Card shown in property grids (home page, listings, related properties).
 * The whole card is a link to the property detail page.
 */
export function PropertyCard({ property, className }: Props) {
    return (
        <Link
            href={show(property.slug)}
            prefetch
            className={cn(
                'group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                className,
            )}
        >
            {/* Photo with badges */}
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {property.cover_url && (
                    <img
                        src={property.cover_url}
                        alt={property.title}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 flex gap-2">
                    <span
                        className={cn(
                            'rounded-full px-3 py-1 text-xs font-semibold',
                            property.listing_type === 'rent'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-emerald-600 text-white',
                        )}
                    >
                        {property.listing_label}
                    </span>
                    {property.is_featured && (
                        <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-gold-foreground">
                            Featured
                        </span>
                    )}
                </div>

                <FavoriteButton
                    propertyId={property.id}
                    propertySlug={property.slug}
                    className="absolute top-3 right-3"
                />

                {/* Price on top of the photo */}
                <p className="absolute bottom-3 left-4 text-xl font-bold text-white drop-shadow">
                    {formatPrice(
                        property.price,
                        property.listing_type === 'sale',
                    )}
                    <span className="text-sm font-medium text-white/80">
                        {' '}
                        {property.price_suffix}
                    </span>
                </p>
            </div>

            {/* Details */}
            <div className="flex flex-1 flex-col gap-3 p-5">
                <p className="text-xs font-semibold tracking-wide text-gold-foreground/80 uppercase dark:text-gold">
                    {property.category.name}
                </p>
                <h3 className="line-clamp-1 text-lg leading-snug font-semibold group-hover:text-primary dark:group-hover:text-gold">
                    {property.title}
                </h3>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-4 shrink-0" />
                    {property.area.name}, {property.area.city}
                </p>

                {/* Key facts */}
                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4 text-sm text-muted-foreground">
                    {property.bedrooms > 0 && (
                        <Fact
                            icon={BedDouble}
                            label={`${property.bedrooms} Beds`}
                        />
                    )}
                    {property.bathrooms > 0 && (
                        <Fact
                            icon={Bath}
                            label={`${property.bathrooms} Baths`}
                        />
                    )}
                    <Fact
                        icon={Maximize}
                        label={`${formatNumber(property.size_sqft)} sqft`}
                    />
                    {property.parking > 0 && (
                        <Fact icon={Car} label={`${property.parking}`} />
                    )}
                </div>
            </div>
        </Link>
    );
}

function Fact({
    icon: Icon,
    label,
}: {
    icon: typeof BedDouble;
    label: string;
}) {
    return (
        <span className="flex items-center gap-1.5">
            <Icon className="size-4" />
            {label}
        </span>
    );
}
