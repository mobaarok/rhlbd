import { Clock, XCircle } from 'lucide-react';
import { DeleteButton } from '@/components/admin/delete-button';
import { StatusBadge } from '@/components/admin/status-badge';
import { Card, PropertyForm } from '@/components/property-form';
import type {
    ExistingProperty,
    PropertyFormOptions,
} from '@/components/property-form';
import owner from '@/routes/owner';

type Props = PropertyFormOptions & {
    property?: ExistingProperty;
};

/**
 * "Post your property" page for property owners
 * ( /my-properties/create  and  /my-properties/{slug}/edit ).
 *
 * Every save sends the listing to the admin for review; it goes live only
 * after approval. Data comes from app/Http/Controllers/Owner/PropertyController.php
 */
export default function OwnerPropertyForm({ property, ...options }: Props) {
    return (
        <PropertyForm
            {...options}
            property={property}
            mode="owner"
            storeUrl={owner.properties.store.url()}
            updateUrl={(slug) => owner.properties.update.url(slug)}
            backHref={owner.properties.index.url()}
            aside={
                property ? (
                    <Card title="Review status" single>
                        <StatusBadge status={property.status} />
                        {property.status === 'pending' && (
                            <p className="flex gap-2 text-sm text-muted-foreground">
                                <Clock className="mt-0.5 size-4 shrink-0" />
                                Our team is checking your listing. It will
                                appear on the website once approved.
                            </p>
                        )}
                        {property.status === 'rejected' && (
                            <div className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                <XCircle className="mt-0.5 size-4 shrink-0" />
                                <div>
                                    <p className="font-semibold">
                                        Changes needed
                                    </p>
                                    <p>{property.rejection_reason}</p>
                                    <p className="mt-1 text-xs">
                                        Fix the listing and press “Save & send
                                        for review”.
                                    </p>
                                </div>
                            </div>
                        )}
                    </Card>
                ) : (
                    <Card title="How it works" single>
                        <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
                            <li>Fill in the details and add photos.</li>
                            <li>Press “Submit for review”.</li>
                            <li>
                                Our team checks it (we may call you), then
                                publishes it on the website.
                            </li>
                        </ol>
                    </Card>
                )
            }
            asideBottom={
                property && (
                    <DeleteButton
                        url={owner.properties.destroy.url(property.slug)}
                        itemName={property.title}
                        withLabel
                    />
                )
            }
        />
    );
}

OwnerPropertyForm.layout = {
    breadcrumbs: [{ title: 'My properties', href: owner.properties.index() }],
};
