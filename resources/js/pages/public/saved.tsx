import { Head, Link, router } from '@inertiajs/react';
import { Heart, Search } from 'lucide-react';
import { useEffect } from 'react';
import { PropertyCard } from '@/components/site/property-card';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/use-favorites';
import { index as properties, saved } from '@/routes/properties';
import type { PropertyCard as PropertyCardType, ResourceList } from '@/types';

type Props = {
    /** Cards for the IDs in the URL (?ids=3,8,12) */
    properties: ResourceList<PropertyCardType>;
    /** false on the very first load, before the browser sent its IDs */
    requested: boolean;
};

/**
 * "Saved homes" ( /saved ): the properties a visitor hearted.
 *
 * The saved IDs live in the visitor's browser (hooks/use-favorites.ts).
 * This page sends them to the server as ?ids=... and shows the cards it gets
 * back. Data comes from PropertyController@saved.
 */
export default function Saved({ properties: list, requested }: Props) {
    const { ids } = useFavorites();
    const idList = ids.join(',');

    // Ask the server for the cards whenever the saved list changes
    useEffect(() => {
        const current = new URLSearchParams(window.location.search).get('ids');

        if (current !== idList) {
            router.get(
                saved.url(),
                { ids: idList },
                { preserveScroll: true, preserveState: true, replace: true },
            );
        }
    }, [idList]);

    // Hide cards that were un-hearted on this page (without waiting for the server)
    const cards = list.data.filter((property) => ids.includes(property.id));
    const loading = !requested && ids.length > 0;

    return (
        <>
            <Head title="Saved homes" />

            <section className="container-page py-12 lg:py-16">
                <div className="mb-8">
                    <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                        <Heart className="size-7 fill-rose-500 text-rose-500" />
                        Saved homes
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Homes you saved on this device. Tap the ♡ on any listing
                        to add it here.
                    </p>
                </div>

                {loading ? (
                    <p className="text-muted-foreground">Loading…</p>
                ) : cards.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {cards.map((property) => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed p-12 text-center">
                        <p className="text-muted-foreground">
                            You haven't saved any homes yet.
                        </p>
                        <Button asChild>
                            <Link href={properties()}>
                                <Search className="size-4" /> Browse properties
                            </Link>
                        </Button>
                    </div>
                )}
            </section>
        </>
    );
}
