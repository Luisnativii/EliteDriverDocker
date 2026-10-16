import { isRentalDate, rentalToday } from './rentalDates.js';
export const RENTAL_SELECTION_KEY = 'eliteDriver.rentalDates';

export function normalizeRentalSelection(value, today = rentalToday()) {
    const startDate = isRentalDate(value?.startDate) && value.startDate >= today ? value.startDate : '';
    const endDate = startDate && isRentalDate(value?.endDate) && value.endDate > startDate ? value.endDate : '';
    return { startDate, endDate };
}

export function restoreRentalSelection(storage) {
    try { return normalizeRentalSelection(JSON.parse(storage.getItem(RENTAL_SELECTION_KEY))); }
    catch { return { startDate: '', endDate: '' }; }
}
