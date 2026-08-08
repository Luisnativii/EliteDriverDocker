import React from "react";


const DetailNoDataSection = ({onBack}) => (

 <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-neutral-800 mb-4">
                        Tipo de vehículo no encontrado
                    </h1>
                    <p className="text-neutral-600 mb-6">
                        El tipo de vehículo no es válido.
                    </p>
                    <button
                        onClick={onBack}
                        className="bg-neutral-600 text-white px-6 py-3 rounded-full hover:bg-neutral-700 transition-colors"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>

);


export default DetailNoDataSection;