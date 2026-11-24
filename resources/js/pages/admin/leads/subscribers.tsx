import { Head } from '@inertiajs/react';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { DeleteButton } from '@/components/admin/delete-button';
import { PageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/site/pagination';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';
import admin from '@/routes/admin';
import type { Paginator } from '@/types';

type Subscriber = { id: number; email: string; created_at: string };

/**
 * Newsletter subscribers ( /admin/subscribers ).
 * "Copy e-mails" puts this page's addresses on the clipboard for pasting into an e-mail tool.
 */
export default function AdminSubscribers({
    subscribers,
}: {
    subscribers: Paginator<Subscriber>;
}) {
    const copyEmails = async () => {
        await navigator.clipboard.writeText(
            subscribers.data.map((s) => s.email).join(', '),
        );
        toast.success('E-mail addresses copied');
    };

    return (
        <>
            <Head title="Subscribers" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Newsletter subscribers"
                    description={`${subscribers.total} people subscribed from the website footer`}
                    actions={
                        subscribers.data.length > 0 && (
                            <Button variant="outline" onClick={copyEmails}>
                                <Copy className="size-4" /> Copy e-mails
                            </Button>
                        )
                    }
                />

                <div className="overflow-x-auto rounded-xl border bg-card">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                            <tr>
                                <th className="p-3">E-mail</th>
                                <th className="p-3">Subscribed</th>
                                <th className="p-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {subscribers.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="p-8 text-center text-muted-foreground"
                                    >
                                        No subscribers yet.
                                    </td>
                                </tr>
                            )}
                            {subscribers.data.map((subscriber) => (
                                <tr key={subscriber.id}>
                                    <td className="p-3 font-medium">
                                        {subscriber.email}
                                    </td>
                                    <td className="p-3 text-muted-foreground">
                                        {formatDate(subscriber.created_at)}
                                    </td>
                                    <td className="p-3 text-right">
                                        <DeleteButton
                                            url={admin.subscribers.destroy.url(
                                                subscriber.id,
                                            )}
                                            itemName={subscriber.email}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination links={subscribers.links} />
            </div>
        </>
    );
}

AdminSubscribers.layout = {
    breadcrumbs: [{ title: 'Subscribers', href: admin.subscribers.index() }],
};
