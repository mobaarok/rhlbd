import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaginationLink } from '@/types';

type Props = {
    /** The "links" array from a Laravel paginator */
    links: PaginationLink[];
    className?: string;
};

/**
 * Page number buttons for any Laravel paginator.
 * Uses Inertia links, so changing page does not reload the whole site.
 */
export function Pagination({ links, className }: Props) {
    // Nothing to show when everything fits on one page ("Previous", "1", "Next")
    if (links.length <= 3) {
        return null;
    }

    return (
        <nav
            className={cn(
                'flex flex-wrap items-center justify-center gap-1.5',
                className,
            )}
            aria-label="Pagination"
        >
            {links.map((link, index) => {
                // Laravel labels the first/last links "&laquo; Previous" / "Next &raquo;"
                const isPrev = index === 0;
                const isNext = index === links.length - 1;
                const label = isPrev ? (
                    <ChevronLeft className="size-4" />
                ) : isNext ? (
                    <ChevronRight className="size-4" />
                ) : (
                    link.label
                );

                const classes = cn(
                    'flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors',
                    link.active
                        ? 'bg-primary text-primary-foreground'
                        : 'border bg-card hover:bg-secondary',
                    !link.url && 'pointer-events-none opacity-40',
                );

                return link.url ? (
                    <Link
                        key={index}
                        href={link.url}
                        preserveScroll={false}
                        className={classes}
                        aria-current={link.active ? 'page' : undefined}
                    >
                        {label}
                    </Link>
                ) : (
                    <span key={index} className={classes}>
                        {label}
                    </span>
                );
            })}
        </nav>
    );
}
