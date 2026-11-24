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
import { Textarea } from '@/components/ui/textarea';
import admin from '@/routes/admin';
import type { Category } from '@/types';

/**
 * Admin page for property categories ( /admin/categories ).
 */
export default function AdminCategories({
    categories,
}: {
    categories: Category[];
}) {
    const [editing, setEditing] = useState<Category | null>(null);
    const [open, setOpen] = useState(false);

    const empty = {
        name: '',
        icon: 'home',
        description: '',
        sort_order: String(categories.length),
    };
    const form = useForm(empty);

    const openCreate = () => {
        setEditing(null);
        form.setData(empty);
        form.clearErrors();
        setOpen(true);
    };

    const openEdit = (category: Category) => {
        setEditing(category);
        form.setData({
            name: category.name,
            icon: category.icon ?? '',
            description: category.description ?? '',
            sort_order: String(category.sort_order),
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
            form.put(admin.categories.update.url(editing.slug), options);
        } else {
            form.post(admin.categories.store.url(), options);
        }
    };

    return (
        <>
            <Head title="Categories" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Categories"
                    description="Types of property. Lower order numbers appear first."
                    actions={
                        <Button onClick={openCreate}>
                            <Plus className="size-4" /> Add category
                        </Button>
                    }
                />

                <div className="overflow-x-auto rounded-xl border bg-card">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                            <tr>
                                <th className="p-3">Order</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Properties</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {categories.map((category) => (
                                <tr
                                    key={category.id}
                                    className="hover:bg-muted/30"
                                >
                                    <td className="p-3 text-muted-foreground">
                                        {category.sort_order}
                                    </td>
                                    <td className="p-3 font-medium">
                                        <span className="flex items-center gap-2">
                                            <DynamicIcon
                                                name={category.icon}
                                                className="size-4 text-muted-foreground"
                                            />
                                            {category.name}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {category.properties_count}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    openEdit(category)
                                                }
                                                aria-label={`Edit ${category.name}`}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <DeleteButton
                                                url={admin.categories.destroy.url(
                                                    category.slug,
                                                )}
                                                itemName={category.name}
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
                title={editing ? 'Edit category' : 'Add category'}
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
                <div className="grid grid-cols-2 gap-4">
                    <FormField id="icon" label="Icon" error={form.errors.icon}>
                        <NativeSelect
                            id="icon"
                            value={form.data.icon}
                            onChange={(e) =>
                                form.setData('icon', e.target.value)
                            }
                        >
                            <option value="">None</option>
                            {ICON_NAMES.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </NativeSelect>
                    </FormField>
                    <FormField
                        id="sort_order"
                        label="Order"
                        error={form.errors.sort_order}
                    >
                        <Input
                            id="sort_order"
                            type="number"
                            min={0}
                            value={form.data.sort_order}
                            onChange={(e) =>
                                form.setData('sort_order', e.target.value)
                            }
                            required
                        />
                    </FormField>
                </div>
                <FormField
                    id="description"
                    label="Description"
                    error={form.errors.description}
                    hint="Shown at the top of the category page."
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
            </EditDialog>
        </>
    );
}

AdminCategories.layout = {
    breadcrumbs: [{ title: 'Categories', href: admin.categories.index() }],
};
