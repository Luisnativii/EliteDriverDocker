import React from "react";


const DetailSpecificationSection = ({ specs }) => (
    <section className="items-center py-16 px-5 bg-gradient-to-br from-stone-600 to-stone-500">
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-12">
                <div className="w-20 h-1 bg-neutral-100 mr-4" />
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-100 uppercase tracking-wide">
                    Especificaciones
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(specs).map(([key, value], index) => (
                    <div
                        key={index}
                        className="group relative bg-white/40 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/30 
                                         hover:bg-white/60 hover:shadow-2xl hover:scale-105 hover:-translate-y-2
                                         transition-all duration-300 ease-out cursor-pointer
                                         before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br 
                                         before:from-white/20 before:via-white/5 before:to-transparent before:opacity-0 
                                         hover:before:opacity-100 before:transition-opacity before:duration-300"
                        style={{
                            animationDelay: `${index * 100}ms`,
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        }}
                    >
                        <div className="relative z-10">
                            <h4 className="font-semibold text-neutral-100 mb-2 group-hover:text-neutral-700 transition-colors duration-200">
                                {key}
                            </h4>
                            <p className="text-neutral-600 group-hover:text-neutral-700 transition-colors duration-200">
                                {value}
                            </p>
                        </div>

                        {/* Efecto de brillo glassmorphism */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent 
                                              rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Reflejo lateral izquierdo */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-white/40 via-white/10 to-transparent 
                                              rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Sombra interna */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-transparent to-neutral-900/5 
                                              opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                ))}
            </div>
        </div>
    </section>

);


export default DetailSpecificationSection;

