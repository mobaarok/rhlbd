import { cn } from '@/lib/utils';
import type { PropertyStatus } from '@/types';

/** Colour and label for each property status. */
const STYLES: Record<PropertyStatus, { className: string; label: string }> = {
    pending: {
        label: 'Pending review',
        className:
            'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400',
    },
    published: {
        label: 'Published',
        className:
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    },
    rejected: {
        label: 'Rejected',
        className:
            'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
    },
    draft: {
        label: 'Draft',
        className:
            'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300',
    },
    rented: {
        label: 'Rented',
        className:
            'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    },
    sold: {
        label: 'Sold',
        className:
            'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
    },
};

/**
 * Small coloured pill showing a property's status.
 * Used in the admin panel and on the owner's "My properties" page.
 */
export function StatusBadge({ status }: { status: PropertyStatus }) {
    const style = STYLES[status];

    return (
        <span
            className={cn(
                'inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
                style.className,
            )}
        >
            {style.label}
        </span>
    );
}
