import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    images: { id: number; url: string }[];
    title: string;
};

/**
 * Photo gallery for the property detail page:
 * one large photo + up to 4 thumbnails, opening a full-screen lightbox.
 * The lightbox supports arrow keys, Escape and swipe-free click navigation.
 */
export function PropertyGallery({ images, title }: Props) {
    // Index of the photo shown in the lightbox, or null when closed
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const close = () => setOpenIndex(null);
    const next = useCallback(
        () => setOpenIndex((i) => (i === null ? i : (i + 1) % images.length)),
        [images.length],
    );
    const prev = useCallback(
        () =>
            setOpenIndex((i) =>
                i === null ? i : (i - 1 + images.length) % images.length,
            ),
        [images.length],
    );

    // Keyboard navigation + lock page scrolling while the lightbox is open
    useEffect(() => {
        if (openIndex === null) {
            return;
        }

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') close();
            if (event.key === 'ArrowRight') next();
            if (event.key === 'ArrowLeft') prev();
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKey);
        };
    }, [openIndex, next, prev]);

    if (images.length === 0) {
        return <div className="aspect-[16/9] rounded-3xl bg-muted" />;
    }

    const [cover, ...rest] = images;
    const thumbnails = rest.slice(0, 4);

    return (
        <>
            <div
                className={cn(
                    'grid gap-3',
                    thumbnails.length > 0 && 'md:grid-cols-4 md:grid-rows-2',
                )}
            >
                <button
                    type="button"
                    onClick={() => setOpenIndex(0)}
                    className="group relative overflow-hidden rounded-3xl md:col-span-2 md:row-span-2"
                >
                    <img
                        src={cover.url}
                        alt={title}
                        className="aspect-[4/3] size-full object-cover transition-transform duration-500 group-hover:scale-105 md:aspect-auto md:h-[460px]"
                    />
                    <span className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                        <Expand className="size-4" /> View {images.length}{' '}
                        photos
                    </span>
                </button>

                {thumbnails.map((image, index) => (
                    <button
                        key={image.id}
                        type="button"
                        onClick={() => setOpenIndex(index + 1)}
                        className="group hidden overflow-hidden rounded-3xl md:block"
                    >
                        <img
                            src={image.url}
                            alt={`${title} photo ${index + 2}`}
                            loading="lazy"
                            className="h-[224px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </button>
                ))}
            </div>

            {/* Lightbox */}
            {openIndex !== null && (
                <div
                    className="fixed inset-0 z-[100] flex animate-in items-center justify-center bg-black/95 duration-200 fade-in"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Photo viewer"
                    onClick={close}
                >
                    <button
                        type="button"
                        onClick={close}
                        className="absolute top-5 right-5 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"
                        aria-label="Close"
                    >
                        <X className="size-5" />
                    </button>

                    <p className="absolute top-6 left-6 text-sm text-white/70">
                        {openIndex + 1} / {images.length}
                    </p>

                    <img
                        src={images[openIndex].url}
                        alt={`${title} photo ${openIndex + 1}`}
                        className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain"
                        onClick={(event) => event.stopPropagation()}
                    />

                    {images.length > 1 && (
                        <>
                            <LightboxArrow side="left" onClick={prev} />
                            <LightboxArrow side="right" onClick={next} />
                        </>
                    )}
                </div>
            )}
        </>
    );
}

function LightboxArrow({
    side,
    onClick,
}: {
    side: 'left' | 'right';
    onClick: () => void;
}) {
    const Icon = side === 'left' ? ChevronLeft : ChevronRight;

    return (
        <button
            type="button"
            onClick={(event) => {
                event.stopPropagation(); // don't close the lightbox
                onClick();
            }}
            className={cn(
                'absolute top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20',
                side === 'left' ? 'left-4' : 'right-4',
            )}
            aria-label={side === 'left' ? 'Previous photo' : 'Next photo'}
        >
            <Icon className="size-6" />
        </button>
    );
}
