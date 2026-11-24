import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

/**
 * Layout for login, register and password screens:
 * a property photo on the left (desktop only) and the form on the right.
 */
export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative grid min-h-dvh lg:grid-cols-2">
            {/* Left: photo + brand (hidden on small screens) */}
            <div className="relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex">
                <img
                    src="/images/properties/living-1.jpg"
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0b1530]/90 to-[#0b1530]/40" />

                <Link
                    href={home()}
                    className="relative z-10 flex items-center gap-2.5 text-lg font-bold"
                >
                    <span className="flex size-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
                        <AppLogoIcon className="size-5" />
                    </span>
                    {name}
                </Link>

                <blockquote className="relative z-10 max-w-md">
                    <p className="text-2xl leading-snug font-semibold">
                        "Found a beautiful furnished flat in Gulshan within
                        three days. Smooth, honest and fast."
                    </p>
                    <footer className="mt-4 text-sm text-white/70">
                        Happy tenant, Gulshan-2
                    </footer>
                </blockquote>
            </div>

            {/* Right: the form */}
            <div className="flex items-center justify-center px-6 py-12">
                <div className="flex w-full max-w-sm flex-col gap-6">
                    <Link
                        href={home()}
                        className="flex items-center justify-center gap-2 font-bold lg:hidden"
                    >
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <AppLogoIcon className="size-5" />
                        </span>
                        {name}
                    </Link>
                    <div className="flex flex-col gap-2 text-center">
                        <h1 className="text-2xl font-bold">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
