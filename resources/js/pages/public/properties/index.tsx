import { Head, router, usePage } from '@inertiajs/react';
import { SearchX, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Pagination } from '@/components/site/pagination';
import { PropertyCard } from '@/components/site/property-card';
import { PropertyFilters } from '@/components/site/property-filters';
import type { Filters } from '@/components/site/property-filters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import type { PropertyCard as PropertyCardType, ResourcePage } from '@/types';

type Props = {
    heading: string;
    description: string | null;
    filters: Filters;
    lockedFilters: string[];
    properties: ResourcePage<PropertyCardType>;
    areas: { name: string; slug: string }[];
    categories: { name: string; slug: string }[];
};

/** Options of the "Sort by" dropdown (must match Property::SORT_OPTIONS in PHP). */
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest first' },
    { value: 'price_asc', label: 'Price: low to high' },
    { value: 'price_desc', label: 'Price: high to low' },
    { value: 'size_desc', label: 'Largest first' },
];

/**
 * Listing / search page.
 * Used by /properties, /areas/{area} and /categories/{category}
 * (see app/Http/Controllers/PropertyController.php).
 *
 * Filters update the URL instantly (no page reload) so results can be shared.
 */
export default function PropertiesIndex({
    heading,
    description,
    filters: initialFilters,
    lockedFilters,
    properties,
    areas,
    categories,
}: Props) {
    const page = usePage();
    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [keyword, setKeyword] = useState(initialFilters.q ?? '');
    const isFirstRender = useRef(true);

    // Current path without the query string, e.g. "/areas/gulshan"
    const path = page.url.split('?')[0];

    /**
     * Ask the server for new results. Locked filters are part of the URL path,
     * so they are left out of the query string.
     */
    const applyFilters = (next: Filters) => {
        const query = Object.fromEntries(
            Object.entries(next).filter(
                ([key, value]) => value && !lockedFilters.includes(key),
            ),
        );

        router.get(path, query, {
            preserveState: true, // keep the filter panel state
            preserveScroll: true,
            replace: true, // don't flood the browser history
            only: ['properties', 'filters'], // only reload what changed
        });
    };

    const updateFilter = (key: keyof Filters, value: string) => {
        const next = { ...filters, [key]: value };
        setFilters(next);
        applyFilters(next);
    };

    const resetFilters = () => {
        setFilters({});
        setKeyword('');
        applyFilters({});
    };

    // Keyword search waits 400ms after the user stops typing (debounce)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        const timer = setTimeout(() => updateFilter('q', keyword), 400);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword]);

    const filterPanel = (
        <PropertyFilters
            filters={filters}
            onChange={updateFilter}
            onReset={resetFilters}
            areas={areas}
            categories={categories}
            locked={lockedFilters}
        />
    );

    return (
        <>
            <Head title={heading} />

            {/* Page header */}
            <section className="border-b bg-gradient-to-b from-secondary to-background">
                <div className="container-page py-12">
                    <p className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">
                        Properties
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                        {heading}
                    </h1>
                    {description && (
                        <p className="mt-3 max-w-2xl text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </section>

            <section className="container-page grid gap-8 py-10 lg:grid-cols-[280px_1fr]">
                {/* Desktop filters */}
                <aside className="hidden lg:block">
                    <div className="sticky top-28 rounded-2xl border bg-card p-6">
                        {filterPanel}
                    </div>
                </aside>

                <div>
                    {/* Toolbar: keyword, mobile filter button, sort */}
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Input
                            type="search"
                            placeholder="Search by title, building or road…"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="h-11 sm:max-w-sm"
                        />
                        <div className="flex items-center gap-2 sm:ml-auto">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="h-11 lg:hidden"
                                    >
                                        <SlidersHorizontal className="size-4" />{' '}
                                        Filters
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="left"
                                    className="w-80 overflow-y-auto"
                                >
                                    <SheetHeader>
                                        <SheetTitle>Filters</SheetTitle>
                                    </SheetHeader>
                                    <div className="px-4 pb-6">
                                        {filterPanel}
                                    </div>
                                </SheetContent>
                            </Sheet>
                            <NativeSelect
                                aria-label="Sort by"
                                value={filters.sort ?? 'newest'}
                                onChange={(e) =>
                                    updateFilter('sort', e.target.value)
                                }
                                className="h-11 min-w-48"
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>
                    </div>

                    <p className="mb-4 text-sm text-muted-foreground">
                        {properties.meta.total === 0
                            ? 'No properties found'
                            : `Showing ${properties.meta.from}–${properties.meta.to} of ${properties.meta.total} properties`}
                    </p>

                    {properties.data.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {properties.data.map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    property={property}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed py-20 text-center">
                            <SearchX className="size-10 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">
                                    No properties match your filters
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Try removing a filter or searching another
                                    area.
                                </p>
                            </div>
                            <Button variant="outline" onClick={resetFilters}>
                                Reset filters
                            </Button>
                        </div>
                    )}

                    <Pagination
                        links={properties.meta.links}
                        className="mt-10"
                    />
                </div>
            </section>
        </>
    );
}
