import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

type Props = {
    /** URL of the DELETE route, e.g. admin.areas.destroy.url(area.id) */
    url: string;
    /** What is being deleted, shown in the confirmation, e.g. "Gulshan" */
    itemName: string;
    /** Show a text label next to the icon */
    withLabel?: boolean;
};

/**
 * Trash button that asks "Are you sure?" before sending a DELETE request.
 */
export function DeleteButton({ url, itemName, withLabel = false }: Props) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const confirmDelete = () => {
        router.delete(url, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size={withLabel ? 'default' : 'icon'}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Delete ${itemName}`}
                >
                    <Trash2 className="size-4" />
                    {withLabel && 'Delete'}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete "{itemName}"?</DialogTitle>
                    <DialogDescription>
                        This cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={confirmDelete}
                        disabled={processing}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
