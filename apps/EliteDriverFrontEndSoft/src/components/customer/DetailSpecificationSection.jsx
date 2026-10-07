import React from "react";


const DetailSpecificationSection = ({ specs }) => (
    <section className="py-12 md:py-16 px-4 sm:px-5 bg-gradient-to-br from-stone-600 to-stone-500">
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-8 md:mb-12">
                <div className="w-20 h-1 bg-neutral-100 mr-4" aria-hidden="true" />
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-100 uppercase tracking-wide">
                    Especificaciones
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {Object.entries(specs).map(([key, value], index) => (
                    <div
                        key={key}
                        className="bg-white/10 backdrop-blur-md p-5 md:p-6 rounded-xl shadow-lg border border-white/20"
                    >
                        <div>
                            <h4 className="font-semibold text-neutral-100 mb-2">
                                {key}
                            </h4>
                            <p className="text-neutral-200 text-[15px] md:text-base">
                                {value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>

);


export default DetailSpecificationSection;

