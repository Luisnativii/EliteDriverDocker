import React from "react";

const DetailHeaderSection = ({ vehicleData, onBack }) => (
     <section className=" min-h-screen items-center bg-neutral-200 text-black py-20 px-5">
                {/* Botón de regreso */}
                <button
                    onClick={onBack}
                    className="flex items-center text-red-500 hover:text-neutral-400 transition-colors mb-8"
                >
                    <div className="w-10 h-px bg-red-500 mr-4" />
                    Volver al inicio
                </button>
                <div className="max-w-6xl mx-auto py-10">


                    <div className="flex items-center mb-8">
                        <div className="w-20 h-1 bg-red-500 mr-4" />
                        <h1 className="text-3xl text-red-500 md:text-4xl font-bold uppercase tracking-wide">
                            {vehicleData.title}
                        </h1>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="flex-1">
                            <p className="text-lg md:text-xl leading-relaxed mb-8">
                                {vehicleData.description}
                            </p>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Características principales:</h3>
                                <ul className="space-y-2">
                                    {vehicleData.features.map((feature, index) => (
                                        <li key={index} className="flex items-center">
                                            <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="flex-1 flex justify-center rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src={vehicleData.image}
                                alt={vehicleData.title}
                                className="w-full h-[400px]  object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>



);


export default DetailHeaderSection;