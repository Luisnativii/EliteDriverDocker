// hooks/useReservations.js
import { useState } from 'react';
import ReservationService from '../services/reservationService';

export const useReservation = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const createReservation = async (reservationData) => {
        setIsLoading(true);
        setError(null);

        try {
            const validation = ReservationService.validateReservation(reservationData);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            const result = await ReservationService.createReservation(reservationData);
            if (!result.success) {
                throw new Error(result.error);
            }

            return { success: true, data: result.data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    };

    const cancelReservation = async (reservationId) => {
        setIsLoading(true);
        setError(null);
        try {
            await ReservationService.deleteReservation(reservationId);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    };

    const getReservationsByUser = async (userId) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await ReservationService.getReservationsByUser(userId);
            if (!result.success) throw new Error(result.error);
            return result.data;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const calculatePrice = (startDate, endDate, pricePerDay) => {
        return ReservationService.calculateTotalPrice(startDate, endDate, pricePerDay);
    };

    const validateDates = (startDate, endDate) => {
        const validation = ReservationService.validateReservation({
            startDate,
            endDate,
            vehicleId: 'temp'
        });

        return {
            isValid: validation.errors.length <= 1,
            errors: validation.errors.filter(err => !err.includes('vehicleId'))
        };
    };

    return {
        createReservation,
        cancelReservation,
        getReservationsByUser,
        calculatePrice,
        validateDates,
        isLoading,
        error,
        clearError: () => setError(null)
    };
};
