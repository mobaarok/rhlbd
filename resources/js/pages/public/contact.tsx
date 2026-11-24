import { Head, useForm, usePage } from '@inertiajs/react';
import { Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { whatsappLink } from '@/lib/format';
import { store } from '@/routes/contact';

/**
 * Contact page ( /contact ) with contact details, a message form and a map.
 */
export default function Contact() {
    const { site } = usePage().props;

    const form = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        website: '', // honeypot, see StoreContactMessageRequest
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.submit(store(), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const channels = [
        {
            icon: Phone,
            label: 'Call us',
            value: site.phone,
            href: `tel:${site.phone}`,
        },
        {
            icon: MessageCircle,
            label: 'WhatsApp',
            value: 'Chat now',
            href: whatsappLink(site.whatsapp),
        },
        {
            icon: Mail,
            label: 'E-mail',
            value: site.email,
            href: `mailto:${site.email}`,
        },
        { icon: MapPin, label: 'Office', value: site.address, href: null },
    ];

    return (
        <>
            <Head title="Contact us" />

            <section className="border-b bg-gradient-to-b from-secondary to-background">
                <div className="container-page py-14">
                    <p className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">
                        Contact
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                        We'd love to hear from you
                    </h1>
                    <p className="mt-3 max-w-2xl text-muted-foreground">
                        Questions about a property, or want to list yours? Send
                        us a message and we'll reply within a few hours.
                    </p>
                </div>
            </section>

            <section className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_1.4fr]">
                {/* Contact channels */}
                <div className="flex flex-col gap-4">
                    {channels.map(({ icon: Icon, label, value, href }) => {
                        const content = (
                            <>
                                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                    <Icon className="size-5" />
                                </span>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {label}
                                    </p>
                                    <p className="font-semibold">{value}</p>
                                </div>
                            </>
                        );

                        return href ? (
                            <a
                                key={label}
                                href={href}
                                target={
                                    href.startsWith('http')
                                        ? '_blank'
                                        : undefined
                                }
                                rel="noreferrer"
                                className="flex items-center gap-4 rounded-2xl border bg-card p-5 transition hover:shadow-md"
                            >
                                {content}
                            </a>
                        ) : (
                            <div
                                key={label}
                                className="flex items-center gap-4 rounded-2xl border bg-card p-5"
                            >
                                {content}
                            </div>
                        );
                    })}
                </div>

                {/* Message form */}
                <form
                    onSubmit={submit}
                    className="rounded-3xl border bg-card p-6 shadow-sm md:p-8"
                >
                    <h2 className="mb-6 text-xl font-bold">Send a message</h2>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                            id="name"
                            label="Full name"
                            error={form.errors.name}
                        >
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                required
                            />
                        </Field>
                        <Field
                            id="email"
                            label="E-mail"
                            error={form.errors.email}
                        >
                            <Input
                                id="email"
                                type="email"
                                value={form.data.email}
                                onChange={(e) =>
                                    form.setData('email', e.target.value)
                                }
                                required
                            />
                        </Field>
                        <Field
                            id="phone"
                            label="Phone (optional)"
                            error={form.errors.phone}
                        >
                            <Input
                                id="phone"
                                type="tel"
                                value={form.data.phone}
                                onChange={(e) =>
                                    form.setData('phone', e.target.value)
                                }
                            />
                        </Field>
                        <Field
                            id="subject"
                            label="Subject"
                            error={form.errors.subject}
                        >
                            <Input
                                id="subject"
                                value={form.data.subject}
                                onChange={(e) =>
                                    form.setData('subject', e.target.value)
                                }
                                required
                            />
                        </Field>
                        <div className="sm:col-span-2">
                            <Field
                                id="message"
                                label="Message"
                                error={form.errors.message}
                            >
                                <Textarea
                                    id="message"
                                    rows={6}
                                    value={form.data.message}
                                    onChange={(e) =>
                                        form.setData('message', e.target.value)
                                    }
                                    required
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Honeypot (hidden) */}
                    <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        className="hidden"
                        value={form.data.website}
                        onChange={(e) =>
                            form.setData('website', e.target.value)
                        }
                    />

                    <Button
                        type="submit"
                        size="lg"
                        className="mt-6 h-11"
                        disabled={form.processing}
                    >
                        {form.processing ? (
                            <Spinner />
                        ) : (
                            <Send className="size-4" />
                        )}
                        Send message
                    </Button>
                </form>
            </section>

            {/* Map */}
            <section className="container-page pb-16">
                <iframe
                    title="Office location"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(site.address)}&z=15&output=embed`}
                    loading="lazy"
                    className="h-96 w-full rounded-3xl border"
                />
            </section>
        </>
    );
}

function Field({
    id,
    label,
    error,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}
