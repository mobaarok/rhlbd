import { router } from '@inertiajs/react';
import { Mail, MailOpen, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { DeleteButton } from '@/components/admin/delete-button';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

type Props = {
    name: string;
    email: string;
    phone: string | null;
    message: string;
    createdAt: string;
    isRead: boolean;
    /** PATCH URL that toggles read / unread */
    readUrl: string;
    /** DELETE URL */
    deleteUrl: string;
    /** Extra line under the name, e.g. the property or subject */
    context?: ReactNode;
};

/**
 * One inquiry or contact message in an admin inbox.
 * Unread items have a gold edge; quick buttons call or e-mail the visitor.
 */
export function LeadCard({
    name,
    email,
    phone,
    message,
    createdAt,
    isRead,
    readUrl,
    deleteUrl,
    context,
}: Props) {
    const toggleRead = () =>
        router.patch(readUrl, {}, { preserveScroll: true });

    return (
        <article
            className={cn(
                'rounded-xl border bg-card p-5',
                !isRead && 'border-l-4 border-l-gold',
            )}
        >
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0">
                    <p className="font-semibold">
                        {name}
                        {!isRead && (
                            <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-xs font-medium text-gold-foreground dark:text-gold">
                                New
                            </span>
                        )}
                    </p>
                    {context && (
                        <div className="text-sm text-muted-foreground">
                            {context}
                        </div>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(createdAt)}
                    </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1">
                    {phone && (
                        <Button asChild variant="outline" size="sm">
                            <a href={`tel:${phone}`}>
                                <Phone className="size-3.5" /> {phone}
                            </a>
                        </Button>
                    )}
                    <Button asChild variant="outline" size="sm">
                        <a href={`mailto:${email}`}>
                            <Mail className="size-3.5" /> E-mail
                        </a>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={toggleRead}>
                        <MailOpen className="size-3.5" />{' '}
                        {isRead ? 'Mark unread' : 'Mark read'}
                    </Button>
                    <DeleteButton
                        url={deleteUrl}
                        itemName={`message from ${name}`}
                    />
                </div>
            </div>
            <p className="mt-3 text-sm whitespace-pre-line">{message}</p>
        </article>
    );
}
