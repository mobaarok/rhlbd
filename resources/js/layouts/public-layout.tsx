import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { WhatsappButton } from '@/components/site/whatsapp-button';

/**
 * Layout for every page under resources/js/pages/public/*.
 * Wired up automatically in resources/js/app.tsx.
 *
 * The home page gets a transparent header that sits on top of the hero image;
 * every other page gets a solid header and top padding so content is not hidden.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
    const isHome = usePage().component === 'public/home';

    return (
        <div className="flex min-h-dvh flex-col bg-background">
            <SiteHeader transparent={isHome} />

            <main className={isHome ? 'flex-1' : 'flex-1 pt-16 lg:pt-20'}>
                {children}
            </main>

            <SiteFooter />
            <WhatsappButton />
        </div>
    );
}
