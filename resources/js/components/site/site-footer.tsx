import { Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Facebook,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    Phone,
    Youtube,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FormEvent } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { about, home } from '@/routes';
import { show as areaPage } from '@/routes/areas';
import { show as contact } from '@/routes/contact';
import { index as properties } from '@/routes/properties';
import { store as subscribe } from '@/routes/subscribers';
import type { SiteSettings } from '@/types';

/** Social media icons in the footer, in display order (keys match config/site.php "social"). */
const SOCIAL_LINKS: {
    key: keyof SiteSettings['social'];
    label: string;
    icon: LucideIcon;
}[] = [
    { key: 'facebook', label: 'Facebook', icon: Facebook },
    { key: 'instagram', label: 'Instagram', icon: Instagram },
    { key: 'youtube', label: 'YouTube', icon: Youtube },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
];

/**
 * Bottom section of every public page: newsletter, links and contact details.
 */
export function SiteFooter() {
    const { name, site, footerAreas } = usePage().props;

    // Newsletter form state (Inertia's useForm handles errors & loading state)
    const form = useForm({ email: '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.submit(subscribe(), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <footer className="bg-primary text-primary-foreground dark:bg-card dark:text-card-foreground">
            {/* Newsletter band */}
            <div className="border-b border-white/10">
                <div className="container-page flex flex-col items-start justify-between gap-6 py-12 lg:flex-row lg:items-center">
                    <div>
                        <h3 className="text-2xl font-bold">
                            Get new listings in your inbox
                        </h3>
                        <p className="mt-1 text-sm text-white/70">
                            Be the first to know about verified properties in
                            Dhaka.
                        </p>
                    </div>
                    <form onSubmit={submit} className="w-full max-w-md">
                        <div className="flex gap-2">
                            <Input
                                type="email"
                                required
                                placeholder="Your e-mail address"
                                value={form.data.email}
                                onChange={(e) =>
                                    form.setData('email', e.target.value)
                                }
                                className="h-11 border-white/20 bg-white/10 text-white placeholder:text-white/50"
                            />
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="h-11 bg-gold px-5 text-gold-foreground hover:bg-gold/90"
                            >
                                Subscribe
                            </Button>
                        </div>
                        <InputError
                            message={form.errors.email}
                            className="mt-2 text-red-300"
                        />
                    </form>
                </div>
            </div>

            {/* Link columns */}
            <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <Link href={home()} className="flex items-center gap-2.5">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                            <AppLogoIcon className="size-5" />
                        </span>
                        <span className="text-lg font-bold">{name}</span>
                    </Link>
                    <p className="mt-4 text-sm leading-relaxed text-white/70">
                        Trusted rental and real estate support in Dhaka.
                        Verified properties, expert guidance and hassle-free
                        renting.
                    </p>
                    {/* Social media icons (URLs come from SITE_*_URL in .env) */}
                    <div className="mt-5 flex gap-2">
                        {SOCIAL_LINKS.map(({ key, label, icon: Icon }) => {
                            const url = site.social[key];
                            const className =
                                'inline-flex size-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-gold hover:text-gold-foreground';

                            // No link set yet: show the icon, but don't make it clickable
                            return url ? (
                                <a
                                    key={key}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={label}
                                    className={className}
                                >
                                    <Icon className="size-4" />
                                </a>
                            ) : (
                                <span
                                    key={key}
                                    title={label}
                                    className={className}
                                >
                                    <Icon className="size-4" />
                                </span>
                            );
                        })}
                    </div>
                </div>

                <FooterColumn title="Explore">
                    <FooterLink href={properties.url()}>
                        All properties
                    </FooterLink>
                    <FooterLink
                        href={properties.url({ query: { type: 'rent' } })}
                    >
                        Properties for rent
                    </FooterLink>
                    <FooterLink
                        href={properties.url({ query: { type: 'sale' } })}
                    >
                        Properties for sale
                    </FooterLink>
                    <FooterLink href={about.url()}>About us</FooterLink>
                    <FooterLink href={contact.url()}>Contact</FooterLink>
                </FooterColumn>

                <FooterColumn title="Popular areas">
                    {footerAreas.map((area) => (
                        <FooterLink
                            key={area.slug}
                            href={areaPage.url(area.slug)}
                        >
                            Apartments in {area.name}
                        </FooterLink>
                    ))}
                </FooterColumn>

                <FooterColumn title="Contact">
                    <li className="flex gap-3 text-sm text-white/70">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
                        {site.address}
                    </li>
                    <li>
                        <a
                            href={`tel:${site.phone}`}
                            className="flex gap-3 text-sm text-white/70 hover:text-white"
                        >
                            <Phone className="size-4 shrink-0 text-gold" />
                            {site.phone}
                        </a>
                    </li>
                    <li>
                        <a
                            href={`mailto:${site.email}`}
                            className="flex gap-3 text-sm text-white/70 hover:text-white"
                        >
                            <Mail className="size-4 shrink-0 text-gold" />
                            {site.email}
                        </a>
                    </li>
                </FooterColumn>
            </div>

            <div className="border-t border-white/10">
                <div className="container-page flex flex-col justify-between gap-2 py-6 text-xs text-white/60 sm:flex-row">
                    <p>
                        © {new Date().getFullYear()} {name}. All rights
                        reserved.
                    </p>
                    <p>Made with care in Dhaka</p>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <h4 className="mb-4 text-sm font-semibold tracking-wider text-gold uppercase">
                {title}
            </h4>
            <ul className="space-y-3">{children}</ul>
        </div>
    );
}

function FooterLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <li>
            <Link
                href={href}
                className="group inline-flex items-center gap-1 text-sm text-white/70 transition-colors hover:text-white"
            >
                <ArrowRight className="size-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                {children}
            </Link>
        </li>
    );
}
