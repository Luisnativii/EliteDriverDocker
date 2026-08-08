import React from "react";


const DetailCTASection =({ title, onViewVehicles }) =>  (
<section className="bg-neutral-800 text-white py-16 px-5">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6">
                        ¿Listo para tu próxima aventura?
                    </h2>
                    <p className="text-lg mb-8">
                        Descubre más sobre nuestros {title}s y encuentra el vehículo perfecto para ti.
                    </p>
                    <div className="space-x-4">
                        <button
                            onClick={onViewVehicles}
                            className="border cursor-pointer text-white border-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-neutral-800 transition-colors"
                        >
                            Ver Modelos
                        </button>
                        
                    </div>
                </div>
            </section>



);


export default DetailCTASection;