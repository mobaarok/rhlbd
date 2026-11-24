import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Star } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { DeleteButton } from '@/components/admin/delete-button';
import { EditDialog } from '@/components/admin/edit-dialog';
import { FormField } from '@/components/admin/form-field';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import admin from '@/routes/admin';
import type { Area } from '@/types';

/**
 * Admin page for neighbourhoods ( /admin/areas ).
 * Add and edit happen in a pop-up dialog on the same page.
 */
export default function AdminAreas({ areas }: { areas: Area[] }) {
    // The area being edited, or null when adding a new one
    const [editing, setEditing] = useState<Area | null>(null);
    const [open, setOpen] = useState(false);

    const form = useForm({
        name: '',
        city: 'Dhaka',
        description: '',
        is_popular: false,
    });

    const openCreate = () => {
        setEditing(null);
        form.setData({
            name: '',
            city: 'Dhaka',
            description: '',
            is_popular: false,
        });
        form.clearErrors();
        setOpen(true);
    };

    const openEdit = (area: Area) => {
        setEditing(area);
        form.setData({
            name: area.name,
            city: area.city,
            description: area.description ?? '',
            is_popular: area.is_popular,
        });
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
            form.put(admin.areas.update.url(editing.slug), options);
        } else {
            form.post(admin.areas.store.url(), options);
        }
    };

    return (
        <>
            <Head title="Areas" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Areas"
                    description="Neighbourhoods where your properties are located. Popular areas appear on the home page."
                    actions={
                        <Button onClick={openCreate}>
                            <Plus className="size-4" /> Add area
                        </Button>
                    }
                />

                <div className="overflow-x-auto rounded-xl border bg-card">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">City</th>
                                <th className="p-3">Properties</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {areas.map((area) => (
                                <tr key={area.id} className="hover:bg-muted/30">
                                    <td className="p-3 font-medium">
                                        <span className="flex items-center gap-1.5">
                                            {area.name}
                                            {area.is_popular && (
                                                <Star
                                                    className="size-3.5 fill-gold text-gold"
                                                    aria-label="Popular"
                                                />
                                            )}
                                        </span>
                                    </td>
                                    <td className="p-3">{area.city}</td>
                                    <td className="p-3">
                                        {area.properties_count}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEdit(area)}
                                                aria-label={`Edit ${area.name}`}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <DeleteButton
                                                url={admin.areas.destroy.url(
                                                    area.slug,
                                                )}
                                                itemName={area.name}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <EditDialog
                open={open}
                onOpenChange={setOpen}
                title={editing ? 'Edit area' : 'Add area'}
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
                <FormField id="city" label="City" error={form.errors.city}>
                    <Input
                        id="city"
                        value={form.data.city}
                        onChange={(e) => form.setData('city', e.target.value)}
                        required
                    />
                </FormField>
                <FormField
                    id="description"
                    label="Description"
                    error={form.errors.description}
                    hint="Shown at the top of the area page."
                >
                    <Textarea
                        id="description"
                        rows={3}
                        value={form.data.description}
                        onChange={(e) =>
                            form.setData('description', e.target.value)
                        }
                    />
                </FormField>
                <label className="flex items-center gap-3 text-sm">
                    <Checkbox
                        checked={form.data.is_popular}
                        onCheckedChange={(checked) =>
                            form.setData('is_popular', checked === true)
                        }
                    />
                    Popular area (show on home page &amp; footer)
                </label>
            </EditDialog>
        </>
    );
}

AdminAreas.layout = {
    breadcrumbs: [{ title: 'Areas', href: admin.areas.index() }],
};
