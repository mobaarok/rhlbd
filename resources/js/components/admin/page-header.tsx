import type { ReactNode } from 'react';

type Props = {
    title: string;
    description?: string;
    /** Buttons shown on the right, e.g. "Add property" */
    actions?: ReactNode;
};

/**
 * Title bar at the top of every admin page.
 */
export function PageHeader({ title, description, actions }: Props) {
    return (
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2">{actions}</div>
            )}
        </div>
    );
}
