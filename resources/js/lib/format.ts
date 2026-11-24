/**
 * Small formatting helpers shared by many components.
 */

/**
 * Format a number with thousands separators: 150000 -> "150,000".
 */
export function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format a price in Taka: 150000 -> "৳150,000".
 * Large sale prices are shortened: 18500000 -> "৳1.85 Crore".
 *
 * @param compact  When true, prices ≥ 1 lakh are shortened (Lakh / Crore).
 */
export function formatPrice(
    value: number,
    compact = false,
    currency = '৳',
): string {
    if (compact && value >= 10_000_000) {
        return `${currency}${trimZeros(value / 10_000_000)} Crore`;
    }

    if (compact && value >= 100_000) {
        return `${currency}${trimZeros(value / 100_000)} Lakh`;
    }

    return `${currency}${formatNumber(value)}`;
}

/** 1.50 -> "1.5", 2.00 -> "2" */
function trimZeros(value: number): string {
    return value.toFixed(2).replace(/\.?0+$/, '');
}

/**
 * Human-friendly date: "2026-11-23T10:00:00Z" -> "23 Nov 2026".
 */
export function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Build a WhatsApp chat link with an optional pre-filled message.
 * `number` must be in international format without "+" (e.g. 8801700000000).
 */
export function whatsappLink(number: string, message?: string): string {
    const text = message ? `?text=${encodeURIComponent(message)}` : '';

    return `https://wa.me/${number}${text}`;
}
