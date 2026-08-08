import React, { createContext, useContext, useState } from 'react';

const DateContext = createContext();

export const useDateContext = () => {
    const context = useContext(DateContext);
    if (!context) {
        throw new Error('useDateContext debe usarse dentro de DateProvider');
    }
    return context;
};

export const DateProvider = ({ children }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const updateDates = (start, end) => {
        setStartDate(start);
        setEndDate(end);
    };

    const clearDates = () => {
        setStartDate('');
        setEndDate('');
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