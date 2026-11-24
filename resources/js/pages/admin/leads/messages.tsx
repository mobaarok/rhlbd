import { Head } from '@inertiajs/react';
import { LeadCard } from '@/components/admin/lead-card';
import { PageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/site/pagination';
import admin from '@/routes/admin';
import type { Paginator } from '@/types';

type ContactMessage = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    read_at: string | null;
    created_at: string;
};

/**
 * Admin inbox of Contact page messages ( /admin/messages ).
 */
export default function AdminMessages({
    messages,
}: {
    messages: Paginator<ContactMessage>;
}) {
    return (
        <>
            <Head title="Messages" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Contact messages"
                    description={`${messages.total} messages from the Contact page`}
                />

                {messages.data.length === 0 && (
                    <p className="text-muted-foreground">No messages yet.</p>
                )}

                <div className="flex flex-col gap-3">
                    {messages.data.map((message) => (
                        <LeadCard
                            key={message.id}
                            name={message.name}
                            email={message.email}
                            phone={message.phone}
                            message={message.message}
                            createdAt={message.created_at}
                            isRead={!!message.read_at}
                            readUrl={admin.messages.read.url(message.id)}
                            deleteUrl={admin.messages.destroy.url(message.id)}
                            context={`Subject: ${message.subject}`}
                        />
                    ))}
                </div>

                <Pagination links={messages.links} />
            </div>
        </>
    );
}

AdminMessages.layout = {
    breadcrumbs: [{ title: 'Messages', href: admin.messages.index() }],
};
