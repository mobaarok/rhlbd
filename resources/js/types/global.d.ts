import type { Auth } from '@/types/auth';
import type { SiteSettings } from '@/types/models';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            /** Business contact details (config/site.php) */
            site: SiteSettings;
            /** Popular areas linked in the footer */
            footerAreas: { name: string; slug: string }[];
            /** Admin only: owner submissions waiting for review */
            pendingCount: number;
            [key: string]: unknown;
        };
    }
}
