import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVehicle } from '../../hooks/useVehicles';
import VehicleFactDetail from '../../components/customer/VehicleFactDetail';
import FacturationDetail from '../../components/customer/FacturationDetail';

const ReservationPage = () => {
    const { vehicleId } = useParams();
    const navigate = useNavigate();
    const { vehicle: selectedVehicle, loading, error } = useVehicle(vehicleId);

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
        mainImageUrl: selectedVehicle.mainImageUrl || "/images/vehicle-placeholder.jpg",
        listImageUrls: Array.isArray(selectedVehicle.listImageUrls)
            ? selectedVehicle.listImageUrls
            : []
    };

    return (
        <div className="min-h-screen pt-24 pb-10 px-4 sm:px-5 bg-gray-50">
            <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
                <button onClick={() => navigate('/customer/vehicles')} className="min-h-11 text-sm text-gray-600 hover:text-gray-900 mb-4">
                    ← Volver a vehículos
                </button>
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reservar Vehículo</h1>
                    <p className="text-sm text-gray-600 mt-1">Elige fechas, revisa el total con IVA y paga en 1 clic con Wompi.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Detalles del Vehículo - Lado Izquierdo */}
                    <VehicleFactDetail vehicle={vehicleWithDecodedImages} />
                    {/* Formulario de Reserva - Lado Derecho */}
                    <FacturationDetail
                        vehicle={vehicleWithDecodedImages}
                    />
                    
                </div>
            </div>
        </div>
    );
};

export default ReservationPage;
