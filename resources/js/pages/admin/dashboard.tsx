import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    Clock,
    Eye,
    FileEdit,
    Inbox,
    Mail,
    Newspaper,
    Plus,
    Users,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { formatDate, formatNumber } from '@/lib/format';
import admin from '@/routes/admin';
import { show } from '@/routes/properties';

type Props = {
    stats: {
        published: number;
        pending: number;
        drafts: number;
        unreadInquiries: number;
        unreadMessages: number;
        subscribers: number;
        users: number;
        totalViews: number;
    };
    latestInquiries: {
        id: number;
        name: string;
        phone: string;
        created_at: string;
        read_at: string | null;
        property: { title: string; slug: string } | null;
    }[];
    topProperties: { id: number; title: string; slug: string; views: number }[];
};

/**
 * Admin home ( /admin ). Data comes from Admin\DashboardController.
 */
export default function AdminDashboard({
    stats,
    latestInquiries,
    topProperties,
}: Props) {
    const cards = [
        {
            label: 'Waiting for review',
            value: stats.pending,
            icon: Clock,
            href: admin.properties.index.url({ query: { status: 'pending' } }),
        },
        {
            label: 'Published properties',
            value: stats.published,
            icon: Building2,
            href: admin.properties.index.url({
                query: { status: 'published' },
            }),
        },
        {
            label: 'Drafts',
            value: stats.drafts,
            icon: FileEdit,
            href: admin.properties.index.url({ query: { status: 'draft' } }),
        },
        {
            label: 'Unread inquiries',
            value: stats.unreadInquiries,
            icon: Inbox,
            href: admin.inquiries.index.url(),
        },
        {
            label: 'Unread messages',
            value: stats.unreadMessages,
            icon: Mail,
            href: admin.messages.index.url(),
        },
        {
            label: 'Subscribers',
            value: stats.subscribers,
            icon: Newspaper,
            href: admin.subscribers.index.url(),
        },
        {
            label: 'Property owners',
            value: stats.users,
            icon: Users,
            href: null,
        },
        {
            label: 'Total listing views',
            value: stats.totalViews,
            icon: Eye,
            href: null,
        },
    ];

    return (
        <>
            <Head title="Admin dashboard" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Dashboard"
                    description="An overview of your listings and leads."
                    actions={
                        <Button asChild>
                            <Link href={admin.properties.create()}>
                                <Plus className="size-4" /> Add property
                            </Link>
                        </Button>
                    }
                />

                {/* Key numbers */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map(({ label, value, icon: Icon, href }) => {
                        const content = (
                            <>
                                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-gold">
                                    <Icon className="size-5" />
                                </span>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {formatNumber(value)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {label}
                                    </p>
                                </div>
                            </>
                        );

                        return href ? (
                            <Link
                                key={label}
                                href={href}
                                className="flex items-center gap-4 rounded-xl border bg-card p-5 transition hover:shadow-md"
                            >
                                {content}
                            </Link>
                        ) : (
                            <div
                                key={label}
                                className="flex items-center gap-4 rounded-xl border bg-card p-5"
                            >
                                {content}
                            </div>
                        );
                    })}
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                    {/* Latest inquiries */}
                    <section className="rounded-xl border bg-card">
                        <div className="flex items-center justify-between border-b p-4">
                            <h2 className="font-semibold">Latest inquiries</h2>
                            <Link
                                href={admin.inquiries.index()}
                                className="text-sm text-primary hover:underline dark:text-gold"
                            >
                                View all
                            </Link>
                        </div>
                        <ul className="divide-y">
                            {latestInquiries.length === 0 && (
                                <li className="p-4 text-sm text-muted-foreground">
                                    No inquiries yet.
                                </li>
                            )}
                            {latestInquiries.map((inquiry) => (
                                <li
                                    key={inquiry.id}
                                    className="flex items-center justify-between gap-4 p-4 text-sm"
                                >
                                    <div className="min-w-0">
                                        <p className="font-medium">
                                            {!inquiry.read_at && (
                                                <span className="mr-2 inline-block size-2 rounded-full bg-gold" />
                                            )}
                                            {inquiry.name} · {inquiry.phone}
                                        </p>
                                        <p className="truncate text-muted-foreground">
                                            {inquiry.property?.title ??
                                                'Property removed'}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {formatDate(inquiry.created_at)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Most viewed */}
                    <section className="rounded-xl border bg-card">
                        <h2 className="border-b p-4 font-semibold">
                            Most viewed properties
                        </h2>
                        <ol className="divide-y">
                            {topProperties.map((property, index) => (
                                <li
                                    key={property.id}
                                    className="flex items-center gap-3 p-4 text-sm"
                                >
                                    <span className="w-5 text-muted-foreground">
                                        {index + 1}.
                                    </span>
                                    <Link
                                        href={show(property.slug)}
                                        className="min-w-0 flex-1 truncate hover:underline"
                                    >
                                        {property.title}
                                    </Link>
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        <Eye className="size-3.5" />{' '}
                                        {formatNumber(property.views)}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </section>
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: admin.dashboard() }],
};
