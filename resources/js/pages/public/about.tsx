import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    HeartHandshake,
    KeyRound,
    Sparkles,
} from 'lucide-react';
import { SectionHeading } from '@/components/site/section-heading';
import { Button } from '@/components/ui/button';
import { show as contact } from '@/routes/contact';
import { index as properties } from '@/routes/properties';

/** Company values shown as cards. Edit the text here. */
const VALUES = [
    {
        icon: BadgeCheck,
        title: 'Verified properties',
        text: 'We visit and check every listing so what you see is what you get.',
    },
    {
        icon: HeartHandshake,
        title: 'Honest advice',
        text: 'Clear prices, fair agreements and no hidden charges, ever.',
    },
    {
        icon: KeyRound,
        title: 'Easy lease terms',
        text: 'Flexible contracts for families, expatriates and companies.',
    },
    {
        icon: Sparkles,
        title: 'Free listing',
        text: 'Property owners can list with us at no upfront cost.',
    },
];

/**
 * Static "About us" page ( /about ).
 */
export default function About() {
    return (
        <>
            <Head title="About us" />

            {/* Intro */}
            <section className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
                <div>
                    <p className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">
                        About us
                    </p>
                    <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                        Your trusted partner for property in Dhaka
                    </h1>
                    <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                        We help families, expatriates and companies find the
                        right place to live and work. Whether you want to rent,
                        buy or list a property, our local team makes the process
                        transparent and stress-free across Gulshan, Banani,
                        Baridhara and nearby areas.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Button asChild size="lg" className="rounded-full">
                            <Link href={properties()}>
                                Browse properties{' '}
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="rounded-full"
                        >
                            <Link href={contact()}>Contact us</Link>
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <img
                        src="/images/properties/living-6.jpg"
                        alt=""
                        loading="lazy"
                        className="aspect-[3/4] rounded-3xl object-cover"
                    />
                    <img
                        src="/images/properties/exterior-3.jpg"
                        alt=""
                        loading="lazy"
                        className="mt-10 aspect-[3/4] rounded-3xl object-cover"
                    />
                </div>
            </section>

            {/* Values */}
            <section className="bg-secondary/60 py-20 dark:bg-card/40">
                <div className="container-page">
                    <SectionHeading
                        eyebrow="Why choose us"
                        title="What we stand for"
                        align="center"
                    />
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {VALUES.map(({ icon: Icon, title, text }) => (
                            <div
                                key={title}
                                className="rounded-2xl border bg-card p-6 transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                    <Icon className="size-6" />
                                </span>
                                <h3 className="mt-5 text-lg font-semibold">
                                    {title}
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
