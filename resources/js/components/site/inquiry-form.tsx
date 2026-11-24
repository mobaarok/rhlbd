import { useForm, usePage } from '@inertiajs/react';
import { Send } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { store } from '@/routes/inquiries';

type Props = {
    propertyId: number;
    propertyTitle: string;
};

/**
 * "Send inquiry" form on the property detail page.
 * Logged-in users get their name and e-mail pre-filled.
 */
export function InquiryForm({ propertyId, propertyTitle }: Props) {
    const { auth } = usePage().props;

    const form = useForm({
        property_id: propertyId,
        name: auth.user?.name ?? '',
        email: auth.user?.email ?? '',
        phone: auth.user?.phone ?? '',
        message: `Hi, I am interested in "${propertyTitle}". Please contact me with more details.`,
        website: '', // honeypot: stays empty for real visitors
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.submit(store(), {
            preserveScroll: true,
            onSuccess: () => form.reset('message'),
        });
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-3">
            <div>
                <Input
                    placeholder="Your name"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    aria-invalid={!!form.errors.name}
                    required
                />
                <InputError message={form.errors.name} className="mt-1" />
            </div>
            <div>
                <Input
                    type="tel"
                    placeholder="Phone number"
                    value={form.data.phone}
                    onChange={(e) => form.setData('phone', e.target.value)}
                    aria-invalid={!!form.errors.phone}
                    required
                />
                <InputError message={form.errors.phone} className="mt-1" />
            </div>
            <div>
                <Input
                    type="email"
                    placeholder="E-mail address"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    aria-invalid={!!form.errors.email}
                    required
                />
                <InputError message={form.errors.email} className="mt-1" />
            </div>
            <div>
                <Textarea
                    rows={4}
                    value={form.data.message}
                    onChange={(e) => form.setData('message', e.target.value)}
                    aria-invalid={!!form.errors.message}
                    required
                />
                <InputError message={form.errors.message} className="mt-1" />
            </div>

            {/* Honeypot field, hidden from humans (see StoreInquiryRequest) */}
            <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                value={form.data.website}
                onChange={(e) => form.setData('website', e.target.value)}
            />

            <Button
                type="submit"
                size="lg"
                disabled={form.processing}
                className="h-11"
            >
                {form.processing ? <Spinner /> : <Send className="size-4" />}
                Send inquiry
            </Button>
        </form>
    );
}
