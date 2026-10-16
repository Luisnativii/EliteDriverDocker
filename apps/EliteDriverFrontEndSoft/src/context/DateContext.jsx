import React, { createContext, useContext, useState, useEffect } from 'react';
import { normalizeRentalSelection, restoreRentalSelection, RENTAL_SELECTION_KEY } from '../utils/rentalSelection.js';

const DateContext = createContext();

export const useDateContext = () => {
    const context = useContext(DateContext);
    if (!context) {
        throw new Error('useDateContext debe usarse dentro de DateProvider');
    }
    return context;
};

export const DateProvider = ({ children }) => {
    const [selection, setSelection] = useState(() => restoreRentalSelection(window.sessionStorage));
    const { startDate, endDate } = selection;
    const setStartDate = value => setSelection(previous => normalizeRentalSelection({ ...previous, startDate: value }));
    const setEndDate = value => setSelection(previous => normalizeRentalSelection({ ...previous, endDate: value }));
    useEffect(() => {
        try { sessionStorage.setItem(RENTAL_SELECTION_KEY, JSON.stringify(selection)); } catch { /* Storage may be unavailable. */ }
    }, [selection]);

    const updateDates = (start, end) => {
        setSelection(normalizeRentalSelection({ startDate: start, endDate: end }));
    };

    const clearDates = () => {
        setSelection({ startDate: '', endDate: '' });
    };

    return (
        <DateContext.Provider value={{
            startDate,
            endDate,
            setStartDate,
            setEndDate,
            updateDates,
            clearDates
        }}>
            {children}
        </DateContext.Provider>
    );
};
