import { ChevronDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * A plain HTML <select> styled to match <Input />.
 *
 * Preferred over the Radix <Select> for filters and admin forms because it
 * works with the phone's native picker and is simpler to use:
 *
 *   <NativeSelect value={x} onChange={(e) => setX(e.target.value)}>
 *       <option value="">Any</option>
 *   </NativeSelect>
 */
function NativeSelect({ className, children, ...props }: React.ComponentProps<'select'>) {
    return (
        <div className="relative">
            <select
                data-slot="native-select"
                className={cn(
                    'flex h-9 w-full appearance-none rounded-md border border-input bg-transparent py-1 pr-9 pl-3 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm dark:bg-input/30 [&>option]:bg-background [&>option]:text-foreground',
                    className,
                )}
                {...props}
            >
                {children}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 opacity-50" />
        </div>
    );
}

export { NativeSelect };
