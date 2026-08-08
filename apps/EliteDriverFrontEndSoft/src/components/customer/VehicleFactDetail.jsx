import React from 'react';
import VehicleImageGallery from '../layout/VehicleImageGallery';

const VehicleFactDetail = ({ vehicle }) => {
    if (!vehicle) {
        return <div>No vehicle data available</div>;
    }
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Galería de imágenes con miniaturas */}
            <VehicleImageGallery
                mainImage={vehicle.mainImageDecoded} 
                imageUrls={vehicle.listImagesDecoded}
            />
            {/* Información del vehículo */}
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{vehicle.name}</h2>

                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Marca:</span>
                        <span className="text-gray-900">{vehicle.brand || 'No especificada'}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Tipo:</span>
                        <span className="text-gray-900">{vehicle.type}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Modelo:</span>
                        <span className="text-gray-900">{vehicle.model || 'No especificado'}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Capacidad:</span>
                        <span className="text-gray-900">{vehicle.capacity || 'No especificada'} personas</span>
                    </div>

                    <div className="border-t pt-3 mt-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Precio por día:</span>
                            <span className="text-2xl font-bold text-stone-900">${vehicle.price}</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Características adicionales */}
            <div className="p-6">
                {vehicle.features && vehicle.features.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Características</h3>
                        <div className="flex flex-wrap gap-2">
                            {vehicle.features.map((feature, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                >
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );


};

export default VehicleFactDetail;  