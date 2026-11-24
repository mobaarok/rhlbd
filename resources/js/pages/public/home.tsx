import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Building2,
    Clock,
    Headset,
    MessageCircle,
    Phone,
    ShieldCheck,
} from 'lucide-react';
import { DynamicIcon } from '@/components/site/dynamic-icon';
import { HeroSearch } from '@/components/site/hero-search';
import { PropertyCard } from '@/components/site/property-card';
import { SectionHeading } from '@/components/site/section-heading';
import { Button } from '@/components/ui/button';
import { whatsappLink } from '@/lib/format';
import { owners } from '@/routes';
import { show as areaPage } from '@/routes/areas';
import { show as categoryPage } from '@/routes/categories';
import { show as contact } from '@/routes/contact';
import { index as properties } from '@/routes/properties';
import type {
    Area,
    Category,
    PropertyCard as PropertyCardType,
    ResourceList,
} from '@/types';

type Props = {
    featured: ResourceList<PropertyCardType>;
    latest: ResourceList<PropertyCardType>;
    categories: Category[];
    popularAreas: Area[];
    areas: { name: string; slug: string }[];
    stats: { properties: number; areas: number; categories: number };
};

/** Reasons shown in the "Why choose us" section. */
const BENEFITS = [
    {
        icon: BadgeCheck,
        title: 'Verified listings',
        text: 'Every property is checked by our team before it goes online.',
    },
    {
        icon: ShieldCheck,
        title: 'Safe & transparent',
        text: 'Clear prices, no hidden fees and honest advice at every step.',
    },
    {
        icon: Clock,
        title: 'Fast move-in',
        text: 'Furnished homes ready to move in, often within the same week.',
    },
    {
        icon: Headset,
        title: '24/7 support',
        text: 'Talk to a real property expert by phone or WhatsApp any time.',
    },
];

/**
 * Public home page ( / ).
 * Data comes from app/Http/Controllers/HomeController.php
 */
export default function Home({
    featured,
    latest,
    categories,
    popularAreas,
    areas,
    stats,
}: Props) {
    const { site } = usePage().props;

    return (
        <>
            <Head title="Find your next home in Dhaka" />

            {/* ───────────────────────── Hero ───────────────────────── */}
            <section className="relative flex min-h-[92vh] items-center overflow-hidden">
                <img
                    src="/images/properties/hero.jpg"
                    alt=""
                    className="absolute inset-0 size-full scale-105 object-cover"
                    fetchPriority="high"
                />
                {/* Dark gradient so white text stays readable */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0b1530]/90 via-[#0b1530]/65 to-[#0b1530]/30" />

                <div className="relative container-page pt-28 pb-16">
                    <div className="max-w-3xl animate-in duration-700 fade-in slide-in-from-bottom-6">
                        <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur">
                            <span className="size-2 rounded-full bg-gold" />
                            {stats.properties}+ verified properties in Dhaka
                        </p>
                        <h1 className="text-4xl leading-[1.1] font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Find a home that
                            <span className="block text-gold">
                                fits your life.
                            </span>
                        </h1>
                        <p className="mt-6 max-w-xl text-lg text-white/80">
                            Luxury apartments, furnished homes and office spaces
                            in Gulshan, Banani, Baridhara and beyond, all
                            verified by our local experts.
                        </p>
                    </div>

                    <div className="mt-10 animate-in delay-150 duration-700 fill-mode-both fade-in slide-in-from-bottom-6">
                        <HeroSearch areas={areas} categories={categories} />
                    </div>

                    {/* Quick stats */}
                    <dl className="mt-12 grid max-w-xl grid-cols-3 gap-6 text-white">
                        <Stat
                            value={`${stats.properties}+`}
                            label="Properties"
                        />
                        <Stat value={`${stats.areas}`} label="Areas covered" />
                        <Stat value="24/7" label="Support" />
                    </dl>
                </div>
            </section>

            {/* ───────────────────────── Categories ───────────────────────── */}
            <section className="container-page py-20">
                <SectionHeading
                    eyebrow="Property types"
                    title="What are you looking for?"
                    description="From cosy furnished apartments to entire office buildings."
                    align="center"
                />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={categoryPage(category.slug)}
                            prefetch
                            className="group flex flex-col items-center gap-3 rounded-2xl border bg-card p-6 text-center transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                        >
                            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground dark:bg-white/5 dark:text-gold">
                                <DynamicIcon
                                    name={category.icon}
                                    className="size-6"
                                />
                            </span>
                            <span className="text-sm leading-tight font-semibold">
                                {category.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {category.properties_count} listings
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ───────────────────────── Featured ───────────────────────── */}
            {featured.data.length > 0 && (
                <section className="bg-secondary/60 py-20 dark:bg-card/40">
                    <div className="container-page">
                        <SectionHeading
                            eyebrow="Handpicked"
                            title="Featured properties"
                            description="Our team's favourite listings this week."
                            action={<ViewAllLink href={properties.url()} />}
                        />
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {featured.data.map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    property={property}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ───────────────────────── Why us ───────────────────────── */}
            <section className="container-page grid items-center gap-12 py-24 lg:grid-cols-2">
                <div className="relative">
                    <img
                        src="/images/properties/living-5.jpg"
                        alt="Bright modern living room"
                        loading="lazy"
                        className="aspect-[4/5] w-full rounded-3xl object-cover shadow-2xl sm:aspect-[4/3] lg:aspect-[4/5]"
                    />
                    <div className="absolute -right-4 -bottom-6 hidden rounded-2xl bg-card p-5 shadow-xl ring-1 ring-border sm:block">
                        <p className="text-3xl font-extrabold text-primary dark:text-gold">
                            10+ yrs
                        </p>
                        <p className="text-sm text-muted-foreground">
                            helping families in Dhaka
                        </p>
                    </div>
                </div>
                <div>
                    <SectionHeading
                        eyebrow="Why choose us"
                        title="Renting made simple, safe and fast"
                        description="We combine local knowledge with a modern, transparent process so you can focus on moving in."
                        className="mb-8"
                    />
                    <div className="grid gap-6 sm:grid-cols-2">
                        {BENEFITS.map(({ icon: Icon, title, text }) => (
                            <div key={title} className="flex gap-4">
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-foreground dark:text-gold">
                                    <Icon className="size-5" />
                                </span>
                                <div>
                                    <h3 className="font-semibold">{title}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────────────────────── Popular areas ───────────────────────── */}
            {popularAreas.length > 0 && (
                <section className="container-page pb-24">
                    <SectionHeading
                        eyebrow="Locations"
                        title="Explore popular areas"
                        description="Find properties in Dhaka's most sought-after neighbourhoods."
                    />
                    <div className="grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {popularAreas.map((area, index) => (
                            <Link
                                key={area.id}
                                href={areaPage(area.slug)}
                                prefetch
                                // The first card is bigger (bento-style grid)
                                className={`group relative overflow-hidden rounded-3xl ${index === 0 ? 'sm:col-span-2 lg:col-span-1 lg:row-span-2' : ''}`}
                            >
                                {area.image && (
                                    <img
                                        src={area.image}
                                        alt={area.name}
                                        loading="lazy"
                                        className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                                <div className="absolute right-5 bottom-5 left-5 flex items-end justify-between text-white">
                                    <div>
                                        <h3 className="text-2xl font-bold">
                                            {area.name}
                                        </h3>
                                        <p className="text-sm text-white/80">
                                            {area.properties_count} properties
                                        </p>
                                    </div>
                                    <span className="flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur transition group-hover:bg-gold group-hover:text-gold-foreground">
                                        <ArrowRight className="size-4" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* ───────────────────────── Latest ───────────────────────── */}
            <section className="bg-secondary/60 py-20 dark:bg-card/40">
                <div className="container-page">
                    <SectionHeading
                        eyebrow="Just listed"
                        title="Latest properties"
                        action={<ViewAllLink href={properties.url()} />}
                    />
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {latest.data.map((property) => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ───────────────────────── Call to action ───────────────────────── */}
            <section className="container-page py-24">
                <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-14 text-primary-foreground sm:px-14 dark:bg-card">
                    <Building2 className="absolute -right-10 -bottom-10 size-72 text-white/5" />
                    <div className="relative grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">
                                Need help?
                            </p>
                            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                                Talk to a property expert today
                            </h2>
                            <p className="mt-4 max-w-xl text-white/75">
                                Tell us what you need and we'll shortlist the
                                best options for you, free of charge. Own a
                                property?{' '}
                                <Link
                                    href={owners()}
                                    className="font-semibold text-gold underline-offset-4 hover:underline"
                                >
                                    Post it on our website
                                </Link>{' '}
                                and our team will review it.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                            <Button
                                asChild
                                size="lg"
                                className="h-12 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                            >
                                <a href={`tel:${site.phone}`}>
                                    <Phone className="size-4" /> Call{' '}
                                    {site.phone}
                                </a>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="h-12 rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                            >
                                <a
                                    href={whatsappLink(site.whatsapp)}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <MessageCircle className="size-4" /> Chat on
                                    WhatsApp
                                </a>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="ghost"
                                className="h-12 rounded-xl text-white hover:bg-white/10 hover:text-white"
                            >
                                <Link href={contact()}>
                                    Send us a message{' '}
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

function Stat({ value, label }: { value: string; label: string }) {
    return (
        <div>
            <dt className="text-sm text-white/70">{label}</dt>
            <dd className="text-2xl font-bold sm:text-3xl">{value}</dd>
        </div>
    );
}

function ViewAllLink({ href }: { href: string }) {
    return (
        <Button asChild variant="outline" className="rounded-full">
            <Link href={href} prefetch>
                View all <ArrowRight className="size-4" />
            </Link>
        </Button>
    );
}
