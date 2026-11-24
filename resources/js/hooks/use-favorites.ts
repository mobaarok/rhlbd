import { useCallback, useSyncExternalStore } from 'react';

/**
 * Favourite ("saved") properties, stored in the visitor's own browser
 * (localStorage). Visitors don't need an account to save homes.
 *
 * Usage:
 *   const { ids, isSaved, toggle } = useFavorites();
 */

const STORAGE_KEY = 'saved-properties';
const EMPTY: number[] = [];

/** Components currently listening for changes. */
const listeners = new Set<() => void>();

/** Cached copy so React gets the same array until something changes. */
let cache: number[] | null = null;

function read(): number[] {
    if (cache) {
        return cache;
    }

    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
        cache = Array.isArray(parsed)
            ? parsed.filter((id): id is number => Number.isInteger(id))
            : [];
    } catch {
        // Private mode or blocked storage: behave as "nothing saved"
        cache = [];
    }

    return cache;
}

function write(ids: number[]): void {
    cache = ids;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
        // Storage unavailable: keep it in memory for this visit only
    }

    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);

    // Keep several open tabs in sync
    const onStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY) {
            cache = null;
            listener();
        }
    };
    window.addEventListener('storage', onStorage);

    return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', onStorage);
    };
}

export function useFavorites() {
    // On the server (no window) we report "nothing saved"
    const ids = useSyncExternalStore(subscribe, read, () => EMPTY);

    const isSaved = useCallback((id: number) => ids.includes(id), [ids]);

    /** Save or un-save a property. Returns true when it is now saved. */
    const toggle = useCallback((id: number) => {
        const current = read();
        const saved = !current.includes(id);
        write(saved ? [id, ...current] : current.filter((x) => x !== id));

        return saved;
    }, []);

    return { ids, isSaved, toggle };
}
