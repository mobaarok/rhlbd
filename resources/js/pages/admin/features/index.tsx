import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { DeleteButton } from '@/components/admin/delete-button';
import { EditDialog } from '@/components/admin/edit-dialog';
import { FormField } from '@/components/admin/form-field';
import { PageHeader } from '@/components/admin/page-header';
import { DynamicIcon, ICON_NAMES } from '@/components/site/dynamic-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import admin from '@/routes/admin';
import type { Feature } from '@/types';

/**
 * Admin page for amenities ( /admin/features ).
 */
export default function AdminFeatures({ features }: { features: Feature[] }) {
    const [editing, setEditing] = useState<Feature | null>(null);
    const [open, setOpen] = useState(false);

    const form = useForm({ name: '', icon: '' });

    const openCreate = () => {
        setEditing(null);
        form.setData({ name: '', icon: '' });
        form.clearErrors();
        setOpen(true);
    };

    const openEdit = (feature: Feature) => {
        setEditing(feature);
        form.setData({ name: feature.name, icon: feature.icon ?? '' });
        form.clearErrors();
        setOpen(true);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        };

        if (editing) {
            form.put(admin.features.update.url(editing.id), options);
        } else {
            form.post(admin.features.store.url(), options);
        }
    };

    return (
        <>
            <Head title="Features" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Features & amenities"
                    description="Ticked on each property and shown with an icon on the property page."
                    actions={
                        <Button onClick={openCreate}>
                            <Plus className="size-4" /> Add feature
                        </Button>
                    }
                />

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            className="flex items-center gap-3 rounded-xl border bg-card p-4"
                        >
                            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary dark:text-gold">
                                <DynamicIcon
                                    name={feature.icon}
                                    className="size-5"
                                />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="font-medium">{feature.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {feature.properties_count} properties
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(feature)}
                                aria-label={`Edit ${feature.name}`}
                            >
                                <Pencil className="size-4" />
                            </Button>
                            <DeleteButton
                                url={admin.features.destroy.url(feature.id)}
                                itemName={feature.name}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <EditDialog
                open={open}
                onOpenChange={setOpen}
                title={editing ? 'Edit feature' : 'Add feature'}
                processing={form.processing}
                onSubmit={submit}
            >
                <FormField id="name" label="Name" error={form.errors.name}>
                    <Input
                        id="name"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        required
                    />
                </FormField>
                <FormField id="icon" label="Icon" error={form.errors.icon}>
                    <NativeSelect
                        id="icon"
                        value={form.data.icon}
                        onChange={(e) => form.setData('icon', e.target.value)}
                    >
                        <option value="">Default (check mark)</option>
                        {ICON_NAMES.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </NativeSelect>
                </FormField>
            </EditDialog>
        </>
    );
}

AdminFeatures.layout = {
    breadcrumbs: [{ title: 'Features', href: admin.features.index() }],
};
