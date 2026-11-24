import { Link, usePage } from '@inertiajs/react';
import { Heart, KeyRound, LayoutDashboard, Menu, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/hooks/use-favorites';
import { about, dashboard, home, owners } from '@/routes';
import { show as contact } from '@/routes/contact';
import { index as properties, saved } from '@/routes/properties';

/** Main menu links, in display order. */
const NAV_LINKS = [
    { label: 'Home', href: home.url() },
    { label: 'Properties', href: properties.url() },
    { label: 'For Rent', href: properties.url({ query: { type: 'rent' } }) },
    { label: 'For Sale', href: properties.url({ query: { type: 'sale' } }) },
    { label: 'About', href: about.url() },
    { label: 'Contact', href: contact.url() },
];

type Props = {
    /**
     * When true the header starts transparent with white text (used on top of
     * the home page hero image) and turns solid once the visitor scrolls.
     */
    transparent?: boolean;
};

/**
 * Top navigation bar of the public website.
 */
export function SiteHeader({ transparent = false }: Props) {
    const page = usePage();
    const { auth, name, site } = page.props;
    const [scrolled, setScrolled] = useState(false);
    const { ids: savedIds } = useFavorites();

    // Switch to the solid style after scrolling 40px
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const solid = !transparent || scrolled;

    return (
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 transition-all duration-300',
                solid
                    ? 'border-b border-border/60 bg-background/85 shadow-sm backdrop-blur-xl'
                    : 'bg-transparent',
            )}
        >
            <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-20">
                {/* Logo */}
                <Link
                    href={home()}
                    className="flex items-center gap-2.5"
                    prefetch
                >
                    <span
                        className={cn(
                            'flex size-9 items-center justify-center rounded-xl transition-colors',
                            solid
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-white/15 text-white ring-1 ring-white/30 backdrop-blur',
                        )}
                    >
                        <AppLogoIcon className="size-5" />
                    </span>
                    <span
                        className={cn(
                            'text-lg font-bold tracking-tight',
                            solid ? 'text-foreground' : 'text-white',
                        )}
                    >
                        {name}
                    </span>
                </Link>

                {/* Desktop menu */}
                <nav className="hidden items-center gap-1 lg:flex">
                    {NAV_LINKS.map((link) => {
                        // Exact match so "/properties" and "/properties?type=rent" highlight separately
                        const active = page.url === link.href;

                        return (
                            <Link
                                key={link.label}
                                href={link.href}
                                prefetch
                                className={cn(
                                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                                    solid
                                        ? 'text-foreground/70 hover:bg-secondary hover:text-foreground'
                                        : 'text-white/85 hover:bg-white/10 hover:text-white',
                                    active &&
                                        (solid
                                            ? 'bg-secondary text-foreground'
                                            : 'bg-white/15 text-white'),
                                )}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right side actions */}
                <div className="flex items-center gap-2">
                    <a
                        href={`tel:${site.phone}`}
                        className={cn(
                            'hidden items-center gap-2 text-sm font-semibold xl:flex',
                            solid ? 'text-foreground' : 'text-white',
                        )}
                    >
                        <Phone className="size-4 text-gold" />
                        {site.phone}
                    </a>

                    {/* Saved homes (kept in this browser, no login needed) */}
                    <Link
                        href={saved()}
                        aria-label={`Saved homes (${savedIds.length})`}
                        className={cn(
                            'relative flex size-9 items-center justify-center rounded-full transition-colors',
                            solid
                                ? 'text-foreground hover:bg-secondary'
                                : 'text-white hover:bg-white/10',
                        )}
                    >
                        <Heart className="size-5" />
                        {savedIds.length > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                                {savedIds.length}
                            </span>
                        )}
                    </Link>

                    <div className="hidden items-center gap-1 sm:flex">
                        {auth.user ? (
                            <Button
                                asChild
                                size="sm"
                                className="rounded-full bg-gold text-gold-foreground hover:bg-gold/90"
                            >
                                <Link href={dashboard()}>
                                    <LayoutDashboard className="size-4" />
                                    {auth.user.is_admin
                                        ? 'Admin'
                                        : 'My properties'}
                                </Link>
                            </Button>
                        ) : (
                            // Visitors don't need an account. Property owners
                            // learn about posting their property on /for-owners,
                            // which then leads to sign up / log in.
                            <Button
                                asChild
                                size="sm"
                                className="rounded-full bg-gold text-gold-foreground hover:bg-gold/90"
                            >
                                <Link href={owners()} prefetch>
                                    <KeyRound className="size-4" /> Property
                                    owner?
                                </Link>
                            </Button>
                        )}
                    </div>

                    {/* Mobile menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    'lg:hidden',
                                    !solid &&
                                        'text-white hover:bg-white/10 hover:text-white',
                                )}
                                aria-label="Open menu"
                            >
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-72">
                            <SheetHeader>
                                <SheetTitle className="text-left">
                                    {name}
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-1 px-4">
                                {NAV_LINKS.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                            <div className="mt-auto flex flex-col gap-2 p-4">
                                <Button asChild variant="outline">
                                    <Link href={saved()}>
                                        <Heart className="size-4" /> Saved homes
                                        ({savedIds.length})
                                    </Link>
                                </Button>
                                {auth.user ? (
                                    <Button asChild>
                                        <Link href={dashboard()}>
                                            {auth.user.is_admin
                                                ? 'Admin panel'
                                                : 'My properties'}
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button
                                        asChild
                                        className="bg-gold text-gold-foreground hover:bg-gold/90"
                                    >
                                        <Link href={owners()}>
                                            <KeyRound className="size-4" /> Are
                                            you a property owner?
                                        </Link>
                                    </Button>
                                )}
                                <Button asChild variant="secondary">
                                    <a href={`tel:${site.phone}`}>
                                        <Phone className="size-4" /> Call{' '}
                                        {site.phone}
                                    </a>
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
