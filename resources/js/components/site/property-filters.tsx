import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { cn } from '@/lib/utils';

/** Every filter the listing page understands (all values are strings from the URL). */
export type Filters = {
    q?: string;
    area?: string;
    category?: string;
    type?: string;
    min_price?: string;
    max_price?: string;
    bedrooms?: string;
    bathrooms?: string;
    min_size?: string;
    max_size?: string;
    sort?: string;
};

type Props = {
    filters: Filters;
    /** Called with the new value whenever one filter changes */
    onChange: (key: keyof Filters, value: string) => void;
    onReset: () => void;
    areas: { name: string; slug: string }[];
    categories: { name: string; slug: string }[];
    /** Filters fixed by the page itself (e.g. "area" on an area page) are hidden */
    locked: string[];
};

/**
 * The filter panel of the listing page (sidebar on desktop, drawer on mobile).
 */
export function PropertyFilters({
    filters,
    onChange,
    onReset,
    areas,
    categories,
    locked,
}: Props) {
    return (
        <div className="flex flex-col gap-6">
            {/* Rent / Sale / Any */}
            <FilterGroup label="Looking to">
                <div className="grid grid-cols-3 gap-1 rounded-xl bg-secondary p-1">
                    {[
                        { value: '', label: 'Any' },
                        { value: 'rent', label: 'Rent' },
                        { value: 'sale', label: 'Buy' },
                    ].map((option) => (
                        <button
                            key={option.label}
                            type="button"
                            onClick={() => onChange('type', option.value)}
                            className={cn(
                                'rounded-lg py-2 text-sm font-medium transition',
                                (filters.type ?? '') === option.value
                                    ? 'bg-background shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </FilterGroup>

            {!locked.includes('area') && (
                <FilterGroup label="Location" htmlFor="filter-area">
                    <NativeSelect
                        id="filter-area"
                        value={filters.area ?? ''}
                        onChange={(e) => onChange('area', e.target.value)}
                    >
                        <option value="">All areas</option>
                        {areas.map((area) => (
                            <option key={area.slug} value={area.slug}>
                                {area.name}
                            </option>
                        ))}
                    </NativeSelect>
                </FilterGroup>
            )}

            {!locked.includes('category') && (
                <FilterGroup label="Property type" htmlFor="filter-category">
                    <NativeSelect
                        id="filter-category"
                        value={filters.category ?? ''}
                        onChange={(e) => onChange('category', e.target.value)}
                    >
                        <option value="">Any type</option>
                        {categories.map((category) => (
                            <option key={category.slug} value={category.slug}>
                                {category.name}
                            </option>
                        ))}
                    </NativeSelect>
                </FilterGroup>
            )}

            <FilterGroup label="Price (৳)">
                <div className="grid grid-cols-2 gap-2">
                    <Input
                        type="number"
                        min={0}
                        placeholder="Min"
                        value={filters.min_price ?? ''}
                        onChange={(e) => onChange('min_price', e.target.value)}
                    />
                    <Input
                        type="number"
                        min={0}
                        placeholder="Max"
                        value={filters.max_price ?? ''}
                        onChange={(e) => onChange('max_price', e.target.value)}
                    />
                </div>
            </FilterGroup>

            <FilterGroup label="Bedrooms">
                <NumberChips
                    value={filters.bedrooms}
                    onChange={(v) => onChange('bedrooms', v)}
                />
            </FilterGroup>

            <FilterGroup label="Bathrooms">
                <NumberChips
                    value={filters.bathrooms}
                    onChange={(v) => onChange('bathrooms', v)}
                />
            </FilterGroup>

            <FilterGroup label="Size (sqft)">
                <div className="grid grid-cols-2 gap-2">
                    <Input
                        type="number"
                        min={0}
                        placeholder="Min"
                        value={filters.min_size ?? ''}
                        onChange={(e) => onChange('min_size', e.target.value)}
                    />
                    <Input
                        type="number"
                        min={0}
                        placeholder="Max"
                        value={filters.max_size ?? ''}
                        onChange={(e) => onChange('max_size', e.target.value)}
                    />
                </div>
            </FilterGroup>

            <Button type="button" variant="outline" onClick={onReset}>
                <RotateCcw className="size-4" /> Reset filters
            </Button>
        </div>
    );
}

function FilterGroup({
    label,
    htmlFor,
    children,
}: {
    label: string;
    htmlFor?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-2">
            <Label
                htmlFor={htmlFor}
                className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
                {label}
            </Label>
            {children}
        </div>
    );
}

/**
 * "Any 1+ 2+ 3+ 4+ 5+" chips. The value means "at least N".
 */
function NumberChips({
    value = '',
    onChange,
}: {
    value?: string;
    onChange: (value: string) => void;
}) {
    const options = ['', '1', '2', '3', '4', '5'];

    return (
        <div className="flex flex-wrap gap-1.5">
            {options.map((option) => (
                <button
                    key={option || 'any'}
                    type="button"
                    onClick={() => onChange(option)}
                    className={cn(
                        'h-9 min-w-11 rounded-full border px-3 text-sm font-medium transition',
                        value === option
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'hover:bg-secondary',
                    )}
                >
                    {option ? `${option}+` : 'Any'}
                </button>
            ))}
        </div>
    );
}
