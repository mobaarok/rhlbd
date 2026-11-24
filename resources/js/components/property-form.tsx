import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ExternalLink,
    ImagePlus,
    Plus,
    Save,
    Send,
    X,
} from 'lucide-react';
import { useMemo } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { FormField } from '@/components/admin/form-field';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { show } from '@/routes/properties';
import type { Option, PropertyStatus } from '@/types';

/** A property being edited (sent by the controller's edit() method). */
export type ExistingProperty = {
    id: number;
    slug: string;
    title: string;
    code: string | null;
    category_id: number;
    area_id: number;
    listing_type: string;
    status: PropertyStatus;
    is_featured: boolean;
    price: number;
    price_period: string;
    bedrooms: number;
    bathrooms: number;
    parking: number;
    floor: number | null;
    size_sqft: number;
    building_name: string | null;
    address: string;
    map_embed_url: string | null;
    description: string;
    nearby: { name: string; distance: string }[];
    contact_name: string | null;
    contact_phone: string | null;
    rejection_reason: string | null;
    feature_ids: number[];
    images: { id: number; url: string }[];
};

/** Dropdown options sent by the controller (HandlesPropertyForm::formOptions). */
export type PropertyFormOptions = {
    categories: { id: number; name: string }[];
    areas: { id: number; name: string }[];
    features: { id: number; name: string }[];
    listingTypes: Option[];
    statuses: Option[];
    pricePeriods: Option[];
};

type Props = PropertyFormOptions & {
    property?: ExistingProperty;
    /**
     * "admin": every field, incl. status / featured / code / contact person.
     * "owner": the fields a property owner may fill in (their listing is
     *          always sent for review, so no status field).
     */
    mode: 'admin' | 'owner';
    /** POST URL for a new property */
    storeUrl: string;
    /** PUT URL for an existing property */
    updateUrl: (slug: string) => string;
    /** Where the "Back" button goes */
    backHref: string;
    /** Extra boxes at the top of the right column (review / status info) */
    aside?: ReactNode;
    /** Extra boxes at the bottom of the right column (e.g. delete button) */
    asideBottom?: ReactNode;
};

/**
 * Create AND edit form for a property, shared by:
 *  - pages/admin/properties/form.tsx  (admin panel, mode="admin")
 *  - pages/owner/properties/form.tsx  (property owners, mode="owner")
 *
 * Numbers are kept as strings while typing; Laravel validates and converts them.
 */
export function PropertyForm({
    property,
    mode,
    categories,
    areas,
    features,
    listingTypes,
    statuses,
    pricePeriods,
    storeUrl,
    updateUrl,
    backHref,
    aside,
    asideBottom,
}: Props) {
    const isEdit = property !== undefined;
    const isAdmin = mode === 'admin';

    const form = useForm({
        title: property?.title ?? '',
        category_id: String(property?.category_id ?? ''),
        area_id: String(property?.area_id ?? ''),
        listing_type: property?.listing_type ?? 'rent',
        price: String(property?.price ?? ''),
        price_period: property?.price_period ?? 'month',
        bedrooms: String(property?.bedrooms ?? 0),
        bathrooms: String(property?.bathrooms ?? 0),
        parking: String(property?.parking ?? 0),
        floor: String(property?.floor ?? ''),
        size_sqft: String(property?.size_sqft ?? ''),
        building_name: property?.building_name ?? '',
        address: property?.address ?? '',
        map_embed_url: property?.map_embed_url ?? '',
        description: property?.description ?? '',
        nearby: property?.nearby ?? [],
        feature_ids: property?.feature_ids ?? [],
        images: [] as File[], // new uploads
        remove_image_ids: [] as number[], // existing photos to delete
        // Admin-only fields (not sent by the owner form, see transform below)
        code: property?.code ?? '',
        status: property?.status ?? 'published',
        is_featured: property?.is_featured ?? false,
        contact_name: property?.contact_name ?? '',
        contact_phone: property?.contact_phone ?? '',
    });

    // Preview URLs for newly picked photos (created in the browser, never uploaded until saved)
    const newImagePreviews = useMemo(
        () => form.data.images.map((file) => URL.createObjectURL(file)),
        [form.data.images],
    );

    // Existing photos minus the ones marked for removal
    const keptImages = (property?.images ?? []).filter(
        (image) => !form.data.remove_image_ids.includes(image.id),
    );

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.transform((data) => {
            // Owners can't set these, so don't send them at all
            const payload: Record<string, unknown> = { ...data };

            if (!isAdmin) {
                for (const key of [
                    'code',
                    'status',
                    'is_featured',
                    'contact_name',
                    'contact_phone',
                ]) {
                    delete payload[key];
                }
            }

            // File uploads need multipart POST; "_method: put" tells Laravel it is an update
            return isEdit ? { ...payload, _method: 'put' } : payload;
        });

        if (isEdit) {
            form.post(updateUrl(property.slug), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () =>
                    form.setData((data) => ({
                        ...data,
                        images: [],
                        remove_image_ids: [],
                    })),
            });
        } else {
            form.post(storeUrl, { forceFormData: true });
        }
    };

    /* ── Small helpers to keep the JSX readable ───────────────────────── */

    /** Props for a simple text/number <Input> bound to a form field. */
    const bind = (field: keyof typeof form.data) => ({
        id: field,
        value: form.data[field] as string,
        onChange: (
            e: ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >,
        ) => form.setData(field, e.target.value as never),
        'aria-invalid': !!form.errors[field as keyof typeof form.errors],
    });

    const toggleFeature = (id: number) =>
        form.setData(
            'feature_ids',
            form.data.feature_ids.includes(id)
                ? form.data.feature_ids.filter((f) => f !== id)
                : [...form.data.feature_ids, id],
        );

    const addImages = (e: ChangeEvent<HTMLInputElement>) => {
        form.setData('images', [
            ...form.data.images,
            ...Array.from(e.target.files ?? []),
        ]);
        e.target.value = ''; // allow picking the same file again
    };

    const updateNearby = (
        index: number,
        key: 'name' | 'distance',
        value: string,
    ) =>
        form.setData(
            'nearby',
            form.data.nearby.map((row, i) =>
                i === index ? { ...row, [key]: value } : row,
            ),
        );

    // Errors for array fields come back as "images.0", "nearby.1.name"... show the first one
    const firstErrorStartingWith = (prefix: string) =>
        Object.entries(form.errors).find(([key]) =>
            key.startsWith(prefix),
        )?.[1];

    // Wording differs a little between the admin panel and the owner form
    const pageTitle = isEdit
        ? 'Edit property'
        : isAdmin
          ? 'Add property'
          : 'Post your property';
    const submitLabel = isAdmin
        ? 'Save'
        : isEdit
          ? 'Save & send for review'
          : 'Submit for review';

    return (
        <>
            <Head title={isEdit ? `Edit ${property.title}` : pageTitle} />

            <form onSubmit={submit} className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title={pageTitle}
                    description={
                        isEdit
                            ? property.title
                            : isAdmin
                              ? 'Fill in the details and add some photos.'
                              : 'Tell us about your property and add some photos. Our team checks every listing before it goes live.'
                    }
                    actions={
                        <>
                            <Button asChild variant="outline">
                                <Link href={backHref}>
                                    <ArrowLeft className="size-4" /> Back
                                </Link>
                            </Button>
                            {isEdit && (
                                <Button asChild variant="outline">
                                    <a
                                        href={show.url(property.slug)}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <ExternalLink className="size-4" />{' '}
                                        {property.status === 'published'
                                            ? 'View'
                                            : 'Preview'}
                                    </a>
                                </Button>
                            )}
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? (
                                    <Spinner />
                                ) : isAdmin ? (
                                    <Save className="size-4" />
                                ) : (
                                    <Send className="size-4" />
                                )}{' '}
                                {submitLabel}
                            </Button>
                        </>
                    }
                />

                {/* Owners: editing a live listing hides it until it is approved again */}
                {!isAdmin && isEdit && property.status === 'published' && (
                    <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                        This listing is live. If you save changes, it will be
                        hidden from the website until our team approves it
                        again.
                    </p>
                )}

                <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                    {/* ───────────── Left column ───────────── */}
                    <div className="flex flex-col gap-6">
                        <Card title="Basic information">
                            <FormField
                                id="title"
                                label="Title"
                                error={form.errors.title}
                                className="sm:col-span-2"
                            >
                                <Input
                                    {...bind('title')}
                                    placeholder="e.g. Elegant 3 Bed Furnished Apartment"
                                    required
                                />
                            </FormField>
                            <FormField
                                id="category_id"
                                label="Category"
                                error={form.errors.category_id}
                            >
                                <NativeSelect {...bind('category_id')} required>
                                    <option value="">Choose…</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </FormField>
                            <FormField
                                id="area_id"
                                label="Area"
                                error={form.errors.area_id}
                            >
                                <NativeSelect {...bind('area_id')} required>
                                    <option value="">Choose…</option>
                                    {areas.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.name}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </FormField>
                            <FormField
                                id="listing_type"
                                label="Listing type"
                                error={form.errors.listing_type}
                            >
                                <NativeSelect {...bind('listing_type')}>
                                    {listingTypes.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </FormField>
                            {isAdmin && (
                                <FormField
                                    id="code"
                                    label="Property code"
                                    error={form.errors.code}
                                    hint="Optional internal reference"
                                >
                                    <Input
                                        {...bind('code')}
                                        placeholder="RH-1024"
                                    />
                                </FormField>
                            )}
                        </Card>

                        <Card title="Price & size">
                            <FormField
                                id="price"
                                label="Price (৳)"
                                error={form.errors.price}
                            >
                                <Input
                                    {...bind('price')}
                                    type="number"
                                    min={0}
                                    required
                                />
                            </FormField>
                            <FormField
                                id="price_period"
                                label="Per"
                                error={form.errors.price_period}
                            >
                                <NativeSelect {...bind('price_period')}>
                                    {pricePeriods.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </FormField>
                            <FormField
                                id="size_sqft"
                                label="Size (sqft)"
                                error={form.errors.size_sqft}
                            >
                                <Input
                                    {...bind('size_sqft')}
                                    type="number"
                                    min={1}
                                    required
                                />
                            </FormField>
                            <FormField
                                id="floor"
                                label="Floor"
                                error={form.errors.floor}
                            >
                                <Input
                                    {...bind('floor')}
                                    type="number"
                                    min={0}
                                />
                            </FormField>
                            <FormField
                                id="bedrooms"
                                label="Bedrooms"
                                error={form.errors.bedrooms}
                            >
                                <Input
                                    {...bind('bedrooms')}
                                    type="number"
                                    min={0}
                                    required
                                />
                            </FormField>
                            <FormField
                                id="bathrooms"
                                label="Bathrooms"
                                error={form.errors.bathrooms}
                            >
                                <Input
                                    {...bind('bathrooms')}
                                    type="number"
                                    min={0}
                                    required
                                />
                            </FormField>
                            <FormField
                                id="parking"
                                label="Parking spaces"
                                error={form.errors.parking}
                            >
                                <Input
                                    {...bind('parking')}
                                    type="number"
                                    min={0}
                                    required
                                />
                            </FormField>
                        </Card>

                        <Card title="Description">
                            <FormField
                                id="description"
                                label="About this property"
                                error={form.errors.description}
                                className="sm:col-span-2"
                            >
                                <Textarea
                                    {...bind('description')}
                                    rows={8}
                                    required
                                />
                            </FormField>
                        </Card>

                        <Card title="Location">
                            <FormField
                                id="address"
                                label="Address"
                                error={form.errors.address}
                                className="sm:col-span-2"
                            >
                                <Input
                                    {...bind('address')}
                                    placeholder="Road 92, Gulshan-2, Dhaka"
                                    required
                                />
                            </FormField>
                            <FormField
                                id="building_name"
                                label="Building name"
                                error={form.errors.building_name}
                            >
                                <Input {...bind('building_name')} />
                            </FormField>
                            <FormField
                                id="map_embed_url"
                                label="Google Maps embed URL"
                                error={form.errors.map_embed_url}
                                hint='Optional. Google Maps → Share → Embed a map → copy the "src" link'
                            >
                                <Input
                                    {...bind('map_embed_url')}
                                    type="url"
                                    placeholder="https://www.google.com/maps/embed?..."
                                />
                            </FormField>
                        </Card>

                        <Card
                            title="Nearby places"
                            description='Shown as "Hospital: 1.2 km" on the property page.'
                        >
                            <div className="flex flex-col gap-2 sm:col-span-2">
                                {form.data.nearby.map((row, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            placeholder="Place (e.g. Hospital)"
                                            value={row.name}
                                            onChange={(e) =>
                                                updateNearby(
                                                    index,
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <Input
                                            placeholder="Distance (e.g. 1.2 km)"
                                            value={row.distance}
                                            onChange={(e) =>
                                                updateNearby(
                                                    index,
                                                    'distance',
                                                    e.target.value,
                                                )
                                            }
                                            className="max-w-40"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Remove place"
                                            onClick={() =>
                                                form.setData(
                                                    'nearby',
                                                    form.data.nearby.filter(
                                                        (_, i) => i !== index,
                                                    ),
                                                )
                                            }
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                                <p className="text-sm text-destructive">
                                    {firstErrorStartingWith('nearby')}
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="self-start"
                                    onClick={() =>
                                        form.setData('nearby', [
                                            ...form.data.nearby,
                                            { name: '', distance: '' },
                                        ])
                                    }
                                >
                                    <Plus className="size-4" /> Add place
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* ───────────── Right column ───────────── */}
                    <div className="flex flex-col gap-6">
                        {aside}

                        {isAdmin && (
                            <Card title="Publishing" single>
                                <FormField
                                    id="status"
                                    label="Status"
                                    error={form.errors.status}
                                    hint="Only “Published” listings appear on the website."
                                >
                                    <NativeSelect {...bind('status')}>
                                        {statuses.map((o) => (
                                            <option
                                                key={o.value}
                                                value={o.value}
                                            >
                                                {o.label}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </FormField>
                                <label className="flex items-center gap-3 text-sm">
                                    <Checkbox
                                        checked={form.data.is_featured}
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'is_featured',
                                                checked === true,
                                            )
                                        }
                                    />
                                    Featured on the home page
                                </label>
                            </Card>
                        )}

                        <Card
                            title="Photos"
                            description="The first photo is the cover. JPG/PNG/WebP, max 5 MB each."
                            single
                        >
                            <div className="grid grid-cols-3 gap-2">
                                {keptImages.map((image, index) => (
                                    <Thumb
                                        key={image.id}
                                        src={image.url}
                                        label={
                                            index === 0 ? 'Cover' : undefined
                                        }
                                        onRemove={() =>
                                            form.setData('remove_image_ids', [
                                                ...form.data.remove_image_ids,
                                                image.id,
                                            ])
                                        }
                                    />
                                ))}
                                {newImagePreviews.map((src, index) => (
                                    <Thumb
                                        key={src}
                                        src={src}
                                        label="New"
                                        onRemove={() =>
                                            form.setData(
                                                'images',
                                                form.data.images.filter(
                                                    (_, i) => i !== index,
                                                ),
                                            )
                                        }
                                    />
                                ))}
                                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-xs text-muted-foreground hover:bg-muted/50">
                                    <ImagePlus className="size-5" />
                                    Add
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        className="hidden"
                                        onChange={addImages}
                                    />
                                </label>
                            </div>
                            <p className="text-sm text-destructive">
                                {firstErrorStartingWith('images')}
                            </p>
                        </Card>

                        <Card title="Features & amenities" single>
                            <div className="grid grid-cols-2 gap-2">
                                {features.map((feature) => (
                                    <label
                                        key={feature.id}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <Checkbox
                                            checked={form.data.feature_ids.includes(
                                                feature.id,
                                            )}
                                            onCheckedChange={() =>
                                                toggleFeature(feature.id)
                                            }
                                        />
                                        {feature.name}
                                    </label>
                                ))}
                            </div>
                        </Card>

                        {isAdmin && (
                            <Card
                                title="Contact person"
                                description="Leave empty to use the main business phone."
                                single
                            >
                                <FormField
                                    id="contact_name"
                                    label="Name"
                                    error={form.errors.contact_name}
                                >
                                    <Input {...bind('contact_name')} />
                                </FormField>
                                <FormField
                                    id="contact_phone"
                                    label="Phone"
                                    error={form.errors.contact_phone}
                                >
                                    <Input
                                        {...bind('contact_phone')}
                                        type="tel"
                                    />
                                </FormField>
                            </Card>
                        )}

                        {asideBottom}
                    </div>
                </div>
            </form>
        </>
    );
}

/**
 * White box grouping related fields.
 * `single` = one column inside; otherwise two columns on larger screens.
 */
export function Card({
    title,
    description,
    single = false,
    children,
}: {
    title: string;
    description?: string;
    single?: boolean;
    children: ReactNode;
}) {
    return (
        <section className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold">{title}</h2>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <div
                className={
                    single
                        ? 'mt-4 flex flex-col gap-4'
                        : 'mt-4 grid gap-4 sm:grid-cols-2'
                }
            >
                {children}
            </div>
        </section>
    );
}

/** Photo thumbnail with a remove (×) button. */
function Thumb({
    src,
    label,
    onRemove,
}: {
    src: string;
    label?: string;
    onRemove: () => void;
}) {
    return (
        <div className="group relative aspect-square overflow-hidden rounded-lg">
            <img src={src} alt="" className="size-full object-cover" />
            {label && (
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                    {label}
                </span>
            )}
            <button
                type="button"
                onClick={onRemove}
                aria-label="Remove photo"
                className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
            >
                <X className="size-3" />
            </button>
        </div>
    );
}
