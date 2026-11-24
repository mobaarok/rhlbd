import { Head, Link, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    Camera,
    ClipboardCheck,
    Eye,
    LogIn,
    MessageCircle,
    Phone,
    ShieldCheck,
    UserPlus,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { whatsappLink } from '@/lib/format';
import { dashboard, postProperty } from '@/routes';

/** The three steps of posting a property. */
const STEPS = [
    {
        icon: UserPlus,
        title: 'Create your owner account',
        text: 'Sign up with your name, e-mail and phone number. It takes less than a minute.',
    },
    {
        icon: Camera,
        title: 'Add your property',
        text: 'Fill in the details: price, size, rooms, location and a few good photos.',
    },
    {
        icon: ClipboardCheck,
        title: 'We review and publish',
        text: 'Our team checks every listing (we may call you), then puts it live on the website.',
    },
];

/** Why owners should list with us. */
const BENEFITS = [
    {
        icon: Users,
        title: 'Reach serious tenants and buyers',
        text: 'Families, expats and companies search our site for homes and offices across Dhaka.',
    },
    {
        icon: ShieldCheck,
        title: 'Every listing is checked',
        text: 'We review all properties before they go live, so visitors trust what they see.',
    },
    {
        icon: Eye,
        title: 'Track your listing',
        text: 'See the review status and how many people viewed your property in your account.',
    },
    {
        icon: BadgeCheck,
        title: 'Edit any time',
        text: 'Update the price or photos whenever you want. Changes are reviewed again before going live.',
    },
];

/**
 * "Are you a property owner?" page ( /for-owners ).
 *
 * Explains that owners can post their property on the website and how it
 * works, then sends them to sign up or log in. Linked from the site header.
 */
export default function Owners() {
    const { auth, site, name } = usePage().props;
    const isLoggedIn = !!auth.user;

    return (
        <>
            <Head title="List your property" />

            {/* ───────────── Hero ───────────── */}
            <section className="bg-primary text-primary-foreground dark:bg-card">
                <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-[1.4fr_1fr] lg:py-24">
                    <div>
                        <p className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">
                            For property owners
                        </p>
                        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                            Have a property to rent or sell?
                        </h1>
                        <p className="mt-4 max-w-xl text-lg text-white/75">
                            Post it on {name} and reach people looking for
                            homes, offices and commercial space in Dhaka. Our
                            team reviews every listing before it goes live.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            {isLoggedIn ? (
                                <Button
                                    asChild
                                    size="lg"
                                    className="h-12 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                                >
                                    <Link href={dashboard()}>
                                        Go to my properties
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        asChild
                                        size="lg"
                                        className="h-12 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                                    >
                                        <Link href={postProperty()}>
                                            <UserPlus className="size-4" />
                                            Create owner account
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline"
                                        className="h-12 rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                                    >
                                        <Link
                                            href={postProperty({
                                                query: { login: 1 },
                                            })}
                                        >
                                            <LogIn className="size-4" />I
                                            already have an account
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Steps summary card */}
                    <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
                        <p className="font-semibold">How it works</p>
                        <ol className="mt-4 flex flex-col gap-4">
                            {STEPS.map((step, index) => (
                                <li key={step.title} className="flex gap-3">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-gold-foreground">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className="font-medium">
                                            {step.title}
                                        </p>
                                        <p className="text-sm text-white/70">
                                            {step.text}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </section>

            {/* ───────────── Benefits ───────────── */}
            <section className="container-page py-16 lg:py-20">
                <h2 className="text-center text-3xl font-bold tracking-tight">
                    Why list with us
                </h2>
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {BENEFITS.map((benefit) => (
                        <div
                            key={benefit.title}
                            className="rounded-2xl border bg-card p-6"
                        >
                            <benefit.icon className="size-8 text-gold" />
                            <h3 className="mt-4 font-semibold">
                                {benefit.title}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {benefit.text}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ───────────── Prefer to talk? ───────────── */}
            <section className="container-page pb-20">
                <div className="flex flex-col items-center gap-4 rounded-3xl bg-secondary p-8 text-center md:p-12">
                    <h2 className="text-2xl font-bold">
                        Prefer to talk to someone?
                    </h2>
                    <p className="max-w-lg text-muted-foreground">
                        Call or message us and our team can add your property
                        for you.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-xl"
                        >
                            <a href={`tel:${site.phone}`}>
                                <Phone className="size-4" /> {site.phone}
                            </a>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-xl"
                        >
                            <a
                                href={whatsappLink(site.whatsapp)}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <MessageCircle className="size-4" /> WhatsApp
                            </a>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
