import { Head, Link } from '@inertiajs/react';
import { LeadCard } from '@/components/admin/lead-card';
import { PageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/site/pagination';
import admin from '@/routes/admin';
import { show } from '@/routes/properties';
import type { Paginator } from '@/types';

type Inquiry = {
    id: number;
    name: string;
    email: string;
    phone: string;
    message: string;
    read_at: string | null;
    created_at: string;
    property: { id: number; title: string; slug: string } | null;
};

/**
 * Admin inbox of property inquiries ( /admin/inquiries ).
 */
export default function AdminInquiries({
    inquiries,
}: {
    inquiries: Paginator<Inquiry>;
}) {
    return (
        <>
            <Head title="Inquiries" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Property inquiries"
                    description={`${inquiries.total} inquiries from the property pages`}
                />

                {inquiries.data.length === 0 && (
                    <p className="text-muted-foreground">No inquiries yet.</p>
                )}

                <div className="flex flex-col gap-3">
                    {inquiries.data.map((inquiry) => (
                        <LeadCard
                            key={inquiry.id}
                            name={inquiry.name}
                            email={inquiry.email}
                            phone={inquiry.phone}
                            message={inquiry.message}
                            createdAt={inquiry.created_at}
                            isRead={!!inquiry.read_at}
                            readUrl={admin.inquiries.read.url(inquiry.id)}
                            deleteUrl={admin.inquiries.destroy.url(inquiry.id)}
                            context={
                                inquiry.property ? (
                                    <Link
                                        href={show(inquiry.property.slug)}
                                        className="hover:underline"
                                    >
                                        About: {inquiry.property.title}
                                    </Link>
                                ) : (
                                    'Property removed'
                                )
                            }
                        />
                    ))}
                </div>

                <Pagination links={inquiries.links} />
            </div>
        </>
    );
}

AdminInquiries.layout = {
    breadcrumbs: [{ title: 'Inquiries', href: admin.inquiries.index() }],
};
