import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import { cn } from '@/lib/utils';
import { index as properties } from '@/routes/properties';
import type { ListingType } from '@/types';

type Props = {
    areas: { name: string; slug: string }[];
    categories: { name: string; slug: string }[];
};

/** Budget choices (monthly rent) shown in the "Max budget" dropdown. */
const BUDGETS = [50_000, 100_000, 150_000, 200_000, 300_000, 500_000];

/**
 * The big search box on the home page hero.
 * Submitting opens /properties with the chosen filters in the URL.
 */
export function HeroSearch({ areas, categories }: Props) {
    const [type, setType] = useState<ListingType>('rent');
    const [area, setArea] = useState('');
    const [category, setCategory] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const submit = (event: FormEvent) => {
        event.preventDefault();

        // Only send filters that have a value, keeping the URL clean
        const query = Object.fromEntries(
            Object.entries({
                type,
                area,
                category,
                max_price: maxPrice,
            }).filter(([, value]) => value !== ''),
        );

        router.get(properties.url(), query);
    };

    return (
        <form onSubmit={submit} className="w-full max-w-4xl">
            {/* Rent / Sale tabs */}
            <div className="inline-flex rounded-t-2xl bg-white/95 p-1.5 pb-0 backdrop-blur dark:bg-card/95">
                {(['rent', 'sale'] as const).map((value) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setType(value)}
                        className={cn(
                            'rounded-t-xl px-6 py-2.5 text-sm font-semibold transition-colors',
                            type === value
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {value === 'rent' ? 'Rent' : 'Buy'}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="grid gap-3 rounded-2xl rounded-tl-none bg-white/95 p-4 shadow-2xl backdrop-blur sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] dark:bg-card/95">
                <Field label="Location">
                    <NativeSelect
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="h-11"
                    >
                        <option value="">All areas</option>
                        {areas.map((a) => (
                            <option key={a.slug} value={a.slug}>
                                {a.name}
                            </option>
                        ))}
                    </NativeSelect>
                </Field>

                <Field label="Property type">
                    <NativeSelect
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="h-11"
                    >
                        <option value="">Any type</option>
                        {categories.map((c) => (
                            <option key={c.slug} value={c.slug}>
                                {c.name}
                            </option>
                        ))}
                    </NativeSelect>
                </Field>

                <Field label="Max budget">
                    <NativeSelect
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="h-11"
                    >
                        <option value="">No limit</option>
                        {BUDGETS.map((budget) => (
                            <option key={budget} value={budget}>
                                Up to ৳{budget.toLocaleString('en-US')}
                            </option>
                        ))}
                    </NativeSelect>
                </Field>

                <Button
                    type="submit"
                    size="lg"
                    className="h-11 self-end rounded-xl px-8 sm:col-span-2 lg:col-span-1"
                >
                    <Search className="size-4" />
                    Search
                </Button>
            </div>
        </form>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label className="flex flex-col gap-1.5 text-left">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {label}
            </span>
            {children}
        </label>
    );
}
