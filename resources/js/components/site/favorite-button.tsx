import { Heart } from 'lucide-react';
import type { MouseEvent } from 'react';
import { toast } from 'sonner';
import { useFavorites } from '@/hooks/use-favorites';
import { cn } from '@/lib/utils';

type Props = {
    propertyId: number;
    /** Kept for compatibility with existing callers (not needed any more) */
    propertySlug?: string;
    className?: string;
};

/**
 * Heart icon that saves / un-saves a property.
 * Saved homes live in the visitor's browser (see hooks/use-favorites.ts),
 * so no login is needed. Used on property cards and the property page.
 */
export function FavoriteButton({ propertyId, className }: Props) {
    const { isSaved, toggle } = useFavorites();
    const saved = isSaved(propertyId);

    const handleClick = (event: MouseEvent) => {
        // The button sits inside a card link: don't open the property
        event.preventDefault();
        event.stopPropagation();

        toast.success(
            toggle(propertyId)
                ? 'Saved to your favourites.'
                : 'Removed from your favourites.',
        );
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={saved ? 'Remove from favourites' : 'Save to favourites'}
            aria-pressed={saved}
            className={cn(
                'flex size-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur transition hover:scale-110',
                className,
            )}
        >
            <Heart
                className={cn(
                    'size-4 transition-colors',
                    saved && 'fill-rose-500 text-rose-500',
                )}
            />
        </button>
    );
}
