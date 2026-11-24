import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bath,
    BedDouble,
    Building,
    Car,
    ChevronRight,
    Eye,
    Layers,
    MapPin,
    Maximize,
    MessageCircle,
    Navigation,
    Phone,
    Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { DynamicIcon } from '@/components/site/dynamic-icon';
import { FavoriteButton } from '@/components/site/favorite-button';
import { InquiryForm } from '@/components/site/inquiry-form';
import { PropertyCard } from '@/components/site/property-card';
import { PropertyGallery } from '@/components/site/property-gallery';
import { SectionHeading } from '@/components/site/section-heading';
import { Button } from '@/components/ui/button';
import {
    formatDate,
    formatNumber,
    formatPrice,
    whatsappLink,
} from '@/lib/format';
import { home } from '@/routes';
import { show as areaPage } from '@/routes/areas';
import { index as properties } from '@/routes/properties';
import type {
    PropertyCard as PropertyCardType,
    PropertyDetail,
    ResourceList,
} from '@/types';

type Props = {
    // A single API Resource is wrapped in { data: ... }
    property: { data: PropertyDetail };
    related: ResourceList<PropertyCardType>;
};

/**
 * Property detail page ( /properties/{slug} ).
 * Data comes from PropertyController@show.
 */
export default function PropertyShow({
    property: { data: property },
    related,
}: Props) {
    const { site } = usePage().props;
    const phone = property.contact_phone || site.phone;

    // Native share sheet on phones; falls back to copying the link
    const share = async () => {
        const url = window.location.href;

        if (navigator.share) {
            await navigator
                .share({ title: property.title, url })
                .catch(() => undefined);
        } else {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard');
        }
    };

    const facts = [
        { icon: BedDouble, label: 'Bedrooms', value: property.bedrooms },
        { icon: Bath, label: 'Bathrooms', value: property.bathrooms },
        {
            icon: Maximize,
            label: 'Size',
            value: `${formatNumber(property.size_sqft)} sqft`,
        },
        { icon: Car, label: 'Parking', value: property.parking },
        { icon: Layers, label: 'Floor', value: property.floor ?? '-' },
        { icon: Eye, label: 'Views', value: formatNumber(property.views) },
    ];

    return (
        <>
            <Head title={property.title}>
                <meta
                    name="description"
                    content={property.description.slice(0, 155)}
                />
                <meta property="og:title" content={property.title} />
                {property.cover_url && (
                    <meta property="og:image" content={property.cover_url} />
                )}
            </Head>

            <div className="container-page py-8">
                {/* Breadcrumbs */}
                <nav
                    className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
                    aria-label="Breadcrumb"
                >
                    <Link href={home()} className="hover:text-foreground">
                        Home
                    </Link>
                    <ChevronRight className="size-4" />
                    <Link href={properties()} className="hover:text-foreground">
                        Properties
                    </Link>
                    <ChevronRight className="size-4" />
                    <Link
                        href={areaPage(property.area.slug)}
                        className="hover:text-foreground"
                    >
                        {property.area.name}
                    </Link>
                    <ChevronRight className="size-4" />
                    <span className="line-clamp-1 text-foreground">
                        {property.title}
                    </span>
                </nav>

                {/* Title row */}
                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <div className="mb-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                                {property.listing_label}
                            </span>
                            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                                {property.category.name}
                            </span>
                            {property.is_featured && (
                                <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-gold-foreground">
                                    Featured
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                            {property.title}
                        </h1>
                        <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="size-4" /> {property.address}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                            onClick={share}
                            aria-label="Share"
                        >
                            <Share2 className="size-4" />
                        </Button>
                        <FavoriteButton
                            propertyId={property.id}
                            propertySlug={property.slug}
                            className="size-9 border bg-background"
                        />
                    </div>
                </div>

                <PropertyGallery
                    images={property.images}
                    title={property.title}
                />

                <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
                    {/* ─────────── Main column ─────────── */}
                    <div className="flex flex-col gap-10">
                        {/* Key facts */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {facts.map(({ icon: Icon, label, value }) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-3 rounded-2xl border bg-card p-4"
                                >
                                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/5 text-primary dark:bg-white/5 dark:text-gold">
                                        <Icon className="size-5" />
                                    </span>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            {label}
                                        </p>
                                        <p className="font-semibold">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Block title="About this property">
                            {/* whitespace-pre-line keeps the paragraphs typed by the admin */}
                            <p className="leading-relaxed whitespace-pre-line text-muted-foreground">
                                {property.description}
                            </p>
                            <dl className="mt-6 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                                {property.code && (
                                    <Detail
                                        label="Property ID"
                                        value={property.code}
                                    />
                                )}
                                {property.building_name && (
                                    <Detail
                                        label="Building"
                                        value={property.building_name}
                                    />
                                )}
                                <Detail
                                    label="Area"
                                    value={`${property.area.name}, ${property.area.city}`}
                                />
                                <Detail
                                    label="Listed on"
                                    value={formatDate(property.listed_at)}
                                />
                            </dl>
                        </Block>

                        {property.features.length > 0 && (
                            <Block title="Features & amenities">
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {property.features.map((feature) => (
                                        <div
                                            key={feature.id}
                                            className="flex items-center gap-2.5 text-sm"
                                        >
                                            <DynamicIcon
                                                name={feature.icon}
                                                className="size-4 text-gold"
                                            />
                                            {feature.name}
                                        </div>
                                    ))}
                                </div>
                            </Block>
                        )}

                        {property.nearby.length > 0 && (
                            <Block title="What's nearby">
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {property.nearby.map((place) => (
                                        <div
                                            key={place.name}
                                            className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Navigation className="size-4 text-primary dark:text-gold" />{' '}
                                                {place.name}
                                            </span>
                                            <span className="font-semibold">
                                                {place.distance}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </Block>
                        )}

                        {property.map_embed_url && (
                            <Block title="Location">
                                <iframe
                                    src={property.map_embed_url}
                                    title={`Map of ${property.title}`}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="h-80 w-full rounded-2xl border"
                                />
                            </Block>
                        )}
                    </div>

                    {/* ─────────── Sidebar (sticky price + contact card) ─────────── */}
                    <aside>
                        <div className="sticky top-28 flex flex-col gap-5 rounded-3xl border bg-card p-6 shadow-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {property.listing_type === 'rent'
                                        ? 'Rent'
                                        : 'Price'}
                                </p>
                                <p className="text-3xl font-extrabold text-primary dark:text-gold">
                                    {formatPrice(
                                        property.price,
                                        property.listing_type === 'sale',
                                    )}
                                    <span className="text-base font-medium text-muted-foreground">
                                        {' '}
                                        {property.price_suffix}
                                    </span>
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-11"
                                >
                                    <a href={`tel:${phone}`}>
                                        <Phone className="size-4" /> Call
                                    </a>
                                </Button>
                                <Button
                                    asChild
                                    className="h-11 bg-[#25D366] text-white hover:bg-[#1ebe5b]"
                                >
                                    <a
                                        href={whatsappLink(
                                            site.whatsapp,
                                            `Hello! I'm interested in "${property.title}" (${window.location.href})`,
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <MessageCircle className="size-4" />{' '}
                                        WhatsApp
                                    </a>
                                </Button>
                            </div>

                            <div className="border-t pt-5">
                                <p className="mb-3 flex items-center gap-2 font-semibold">
                                    <Building className="size-4" /> Request
                                    details or a visit
                                </p>
                                <InquiryForm
                                    propertyId={property.id}
                                    propertyTitle={property.title}
                                />
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Related listings */}
                {related.data.length > 0 && (
                    <section className="mt-20">
                        <SectionHeading
                            eyebrow="You may also like"
                            title="Similar properties"
                        />
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {related.data.map((item) => (
                                <PropertyCard key={item.id} property={item} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}

function Block({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section>
            <h2 className="mb-4 text-xl font-bold">{title}</h2>
            {children}
        </section>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between border-b border-dashed pb-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value}</dd>
        </div>
    );
}
