import { useForm } from '@inertiajs/react';
import { Check, Mail, Phone, User, X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { DeleteButton } from '@/components/admin/delete-button';
import { EditDialog } from '@/components/admin/edit-dialog';
import { StatusBadge } from '@/components/admin/status-badge';
import { Card, PropertyForm } from '@/components/property-form';
import type {
    ExistingProperty,
    PropertyFormOptions,
} from '@/components/property-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import admin from '@/routes/admin';

type Props = PropertyFormOptions & {
    property?: ExistingProperty;
    /** The property owner who submitted it (null = added by the admin) */
    owner?: { name: string; email: string; phone: string | null } | null;
};

/**
 * Admin create / edit page for a property
 * ( /admin/properties/create  and  /admin/properties/{slug}/edit ).
 *
 * For listings submitted by a property owner it also shows a "Review" box
 * with the owner's contact details and Approve / Reject buttons.
 */
export default function AdminPropertyForm({
    property,
    owner,
    ...options
}: Props) {
    return (
        <PropertyForm
            {...options}
            property={property}
            mode="admin"
            storeUrl={admin.properties.store.url()}
            updateUrl={(slug) => admin.properties.update.url(slug)}
            backHref={admin.properties.index.url()}
            aside={
                property && owner ? (
                    <ReviewCard property={property} owner={owner} />
                ) : undefined
            }
            asideBottom={
                property && (
                    <DeleteButton
                        url={admin.properties.destroy.url(property.slug)}
                        itemName={property.title}
                        withLabel
                    />
                )
            }
        />
    );
}

/**
 * Owner details + Approve / Reject for an owner-submitted listing.
 * Approve publishes it; Reject asks for a reason the owner will see.
 */
function ReviewCard({
    property,
    owner,
}: {
    property: ExistingProperty;
    owner: NonNullable<Props['owner']>;
}) {
    const [rejectOpen, setRejectOpen] = useState(false);
    const approveForm = useForm({});
    const rejectForm = useForm({ reason: property.rejection_reason ?? '' });

    const approve = () =>
        approveForm.patch(admin.properties.approve.url(property.slug), {
            preserveScroll: true,
        });

    const reject = (event: FormEvent) => {
        event.preventDefault();
        rejectForm.patch(admin.properties.reject.url(property.slug), {
            preserveScroll: true,
            onSuccess: () => setRejectOpen(false),
        });
    };

    return (
        <Card title="Owner submission" single>
            <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={property.status} />
            </div>

            {/* Who to call about this listing */}
            <ul className="flex flex-col gap-1.5 text-sm">
                <li className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground" />
                    {owner.name}
                </li>
                <li className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" />
                    <a
                        href={`mailto:${owner.email}`}
                        className="hover:underline"
                    >
                        {owner.email}
                    </a>
                </li>
                {owner.phone && (
                    <li className="flex items-center gap-2">
                        <Phone className="size-4 text-muted-foreground" />
                        <a
                            href={`tel:${owner.phone}`}
                            className="hover:underline"
                        >
                            {owner.phone}
                        </a>
                    </li>
                )}
            </ul>

            {property.status === 'rejected' && property.rejection_reason && (
                <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <strong>Rejected:</strong> {property.rejection_reason}
                </p>
            )}

            <div className="flex gap-2">
                {property.status !== 'published' && (
                    <Button
                        type="button"
                        onClick={approve}
                        disabled={approveForm.processing}
                        className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                        <Check className="size-4" /> Approve
                    </Button>
                )}
                {property.status !== 'rejected' && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setRejectOpen(true)}
                        className="flex-1 text-destructive"
                    >
                        <X className="size-4" /> Reject
                    </Button>
                )}
            </div>
            <p className="text-xs text-muted-foreground">
                Tip: save any edits to the form first, then approve.
            </p>

            <EditDialog
                open={rejectOpen}
                onOpenChange={setRejectOpen}
                title="Reject this listing"
                processing={rejectForm.processing}
                onSubmit={reject}
            >
                <div className="grid gap-2">
                    <Label htmlFor="reason">
                        Reason (the owner will see this)
                    </Label>
                    <Textarea
                        id="reason"
                        rows={4}
                        value={rejectForm.data.reason}
                        onChange={(e) =>
                            rejectForm.setData('reason', e.target.value)
                        }
                        placeholder="e.g. Please upload brighter photos of the living room."
                        required
                    />
                    {rejectForm.errors.reason && (
                        <p className="text-sm text-destructive">
                            {rejectForm.errors.reason}
                        </p>
                    )}
                </div>
            </EditDialog>
        </Card>
    );
}

AdminPropertyForm.layout = {
    breadcrumbs: [{ title: 'Properties', href: admin.properties.index() }],
};
