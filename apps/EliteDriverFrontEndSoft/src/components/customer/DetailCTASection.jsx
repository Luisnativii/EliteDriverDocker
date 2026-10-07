import React from "react";


const DetailCTASection =({ title, onViewVehicles, onBack }) =>  (
<section className="bg-neutral-800 text-white py-12 md:py-16 px-5">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
                        ¿Listo para tu próxima aventura?
                    </h2>
                    <p className="text-base md:text-lg mb-8 text-white/80">
                        Descubre más sobre nuestros {title}s y encuentra el vehículo perfecto para ti.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                            onClick={onViewVehicles}
                            className="w-full sm:w-auto min-h-11 px-8 py-3 rounded-full font-semibold bg-white text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 transition-colors cursor-pointer"
                        >
                            Ver Modelos Disponibles
                        </button>
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="w-full sm:w-auto min-h-11 px-8 py-3 rounded-full font-semibold border border-white/60 text-white hover:bg-white hover:text-neutral-800 transition-colors cursor-pointer"
                            >
                                Volver al inicio
                            </button>
                        )}
                    </div>
                </div>
            </section>



);


export default DetailCTASection;