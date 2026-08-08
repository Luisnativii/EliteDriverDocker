import React from 'react';
import {useParams} from 'react-router-dom';
import { useVehicle } from '../../hooks/useVehicles';
import { useReservation }  from '../../hooks/useReservations'
import VehicleFactDetail from '../../components/customer/VehicleFactDetail';
import FacturationDetail from '../../components/customer/FacturationDetail';

const getBase64ImageSrc = (base64) => {
    if (!base64) return "/images/vehicle-placeholder.jpg";

    const clean = base64.trim().replace(/\\n/g, "").replace(/\s/g, "");

    const mimeType =
        clean.startsWith("/") ? "image/jpeg" :
        clean.startsWith("iVBOR") ? "image/png" :
        clean.startsWith("UklGR") ? "image/webp" :
        "image/jpeg";

    return `data:${mimeType};base64,${clean}`;
};

const ReservationPage = () => {
    const { vehicleId } = useParams();
    const { vehicle: selectedVehicle, loading, error } = useVehicle(vehicleId);
    const {createReservation, isLoading: reservationLoading} = useReservation();
    //funcion del hook
    const handleReservation = async (reservationData) => {
        const result = await createReservation(reservationData);
        
        if (result.success) {
            alert('¡Reserva realizada con éxito!');
            // Opcional: redirigir a página de confirmación
            // navigate('/reservation-confirmation', { state: { reservation: result.data } });
        } else {
            alert(`Error: ${result.error}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    if (error || !selectedVehicle) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-xl">Vehículo no encontrado</p>
                </div>
            </div>
        );
    }

    const vehicleWithDecodedImages = {
        ...selectedVehicle,
        mainImageDecoded: getBase64ImageSrc(selectedVehicle.mainImageBase64),
        listImagesDecoded: Array.isArray(selectedVehicle.listImagesBase64)
            ? selectedVehicle.listImagesBase64.map(getBase64ImageSrc)
            : []
    };

    return (
        <div className="min-h-screen py-20 px-5 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Reservar Vehículo</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Detalles del Vehículo - Lado Izquierdo */}
                    <VehicleFactDetail vehicle={vehicleWithDecodedImages} />
                    {/* Formulario de Reserva - Lado Derecho */}
                    <FacturationDetail 
                        vehicle={vehicleWithDecodedImages} 
                        onReservation={handleReservation}
                        isLoading={reservationLoading}
                    />
                    
                </div>
            </div>
        </div>
    );
};

export default ReservationPage;