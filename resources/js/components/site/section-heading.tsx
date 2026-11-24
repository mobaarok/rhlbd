import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    /** Small gold label above the title, e.g. "Featured" */
    eyebrow?: string;
    title: string;
    description?: string;
    /** Optional element on the right side (e.g. a "View all" link) */
    action?: ReactNode;
    align?: 'left' | 'center';
    className?: string;
};

/**
 * Consistent heading for every section of the public website.
 */
export function SectionHeading({
    eyebrow,
    title,
    description,
    action,
    align = 'left',
    className,
}: Props) {
    return (
        <div
            className={cn(
                'mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between',
                align === 'center' &&
                    'items-center text-center md:flex-col md:items-center',
                className,
            )}
        >
            <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
                {eyebrow && (
                    <p className="mb-2 text-sm font-semibold tracking-[0.2em] text-gold uppercase">
                        {eyebrow}
                    </p>
                )}
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                    {title}
                </h2>
                {description && (
                    <p className="mt-3 text-muted-foreground">{description}</p>
                )}
            </div>
            {action}
        </div>
    );
}
