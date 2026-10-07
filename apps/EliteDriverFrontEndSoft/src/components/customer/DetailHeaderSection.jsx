import React from "react";

const DetailHeaderSection = ({ vehicleData, onBack }) => (
     <section className="bg-neutral-200 text-black pt-24 pb-10 px-4 sm:px-5">
                {/* Botón de regreso */}
                <button
                    onClick={onBack}
                    className="flex items-center min-h-11 text-red-500 hover:text-neutral-400 transition-colors mb-6"
                >
                    <div className="w-10 h-px bg-red-500 mr-4" aria-hidden="true" />
                    Volver al inicio
                </button>
                <div className="max-w-6xl mx-auto py-4 md:py-10">


                    <div className="flex items-center mb-6 md:mb-8">
                        <div className="w-20 h-1 bg-red-500 mr-4" aria-hidden="true" />
                        <h1 className="text-3xl text-red-500 md:text-4xl font-bold uppercase tracking-wide">
                            {vehicleData.title}
                        </h1>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                        <div className="flex-1 w-full">
                            <p className="text-base md:text-xl leading-relaxed mb-8">
                                {vehicleData.description}
                            </p>

                            <div className="space-y-4">
                                <h3 className="text-lg md:text-xl font-semibold">Características principales:</h3>
                                <ul className="space-y-2.5 text-[15px] md:text-base">
                                    {vehicleData.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 shrink-0" aria-hidden="true"></span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="flex-1 w-full flex justify-center rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src={vehicleData.image}
                                alt={`Vehículo ${vehicleData.title} en alquiler`}
                                loading="lazy"
                                decoding="async"
                                className="w-full aspect-[4/3] object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>



);


export default DetailHeaderSection;