import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Props = {
    /** id of the input inside, so clicking the label focuses it */
    id: string;
    label: string;
    /** Validation error from Laravel (form.errors.fieldName) */
    error?: string;
    /** Small grey help text under the input */
    hint?: string;
    className?: string;
    children: ReactNode;
};

/**
 * Label + input + error message, the building block of every admin form.
 *
 *   <FormField id="title" label="Title" error={form.errors.title}>
 *       <Input id="title" ... />
 *   </FormField>
 */
export function FormField({
    id,
    label,
    error,
    hint,
    className,
    children,
}: Props) {
    return (
        <div className={cn('grid gap-2', className)}>
            <Label htmlFor={id}>{label}</Label>
            {children}
            {hint && !error && (
                <p className="text-xs text-muted-foreground">{hint}</p>
            )}
            <InputError message={error} />
        </div>
    );
}
