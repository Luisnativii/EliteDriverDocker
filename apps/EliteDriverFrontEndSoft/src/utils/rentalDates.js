// Calendar dates belong to the rental business, regardless of the visitor's timezone.
export const RENTAL_TIME_ZONE = 'America/El_Salvador';

export function rentalToday(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: RENTAL_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(now);
    const value = type => parts.find(part => part.type === type).value;
    return `${value('year')}-${value('month')}-${value('day')}`;
}

export function isRentalDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function rentalDays(start, end) {
    if (!isRentalDate(start) || !isRentalDate(end) || end <= start) return 0;
    return (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000;
}
