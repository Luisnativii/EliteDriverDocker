import React, { useState, useEffect } from 'react';

const VehicleImageGallery = ({ mainImage, imageUrls = [] }) => {
    const allImages = [mainImage, ...imageUrls].filter(Boolean);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedImage = allImages[selectedIndex] || null;
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    

    useEffect(() => {
        setSelectedIndex(0);
    }, [mainImage]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isLightboxOpen) return;

            if (e.key === 'ArrowLeft' && selectedIndex > 0) {
                setSelectedIndex((prev) => prev - 1);
            } else if (e.key === 'ArrowRight' && selectedIndex < allImages.length - 1) {
                setSelectedIndex((prev) => prev + 1);
            } else if (e.key === 'Escape') {
                setIsLightboxOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, selectedIndex, allImages.length]);

    return (
        <div className="bg-gray-100">
            {/* Imagen principal con flechas */}
            <div className="relative h-64 flex items-center justify-center bg-gray-200 overflow-hidden">
                {selectedImage ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Flecha izquierda */}
                        {selectedIndex > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedIndex((prev) => prev - 1);
                                }}
                                className="absolute left-2 z-10 text-white bg-black/50 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center text-2xl"
                            >
                                ‹
                            </button>
                        )}

                        {/* Imagen principal */}
                        <img
                            src={selectedImage}
                            alt="Vista ampliada"
                            onClick={() => setIsLightboxOpen(true)}
                            className="h-full w-full object-cover transition-all duration-300 cursor-zoom-in"
                        />

                        {/* Flecha derecha */}
                        {selectedIndex < allImages.length - 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedIndex((prev) => prev + 1);
                                }}
                                className="absolute right-2 z-10 text-white bg-black/50 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center text-2xl"
                            >
                                ›
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="text-gray-400">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                )}
            </div>

            {/* Miniaturas */}
            {allImages.length > 1 && (
                <div className="flex overflow-x-auto gap-2 p-2 bg-white border-t border-gray-200 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                    {allImages.map((url, idx) => (
                        <img
                            key={idx}
                            src={url}
                            onClick={() => setSelectedIndex(idx)}
                            className={`h-20 w-28 object-cover rounded cursor-pointer border-2 transition-all duration-200 ${selectedIndex === idx ? 'border-red-500 scale-105' : 'border-transparent hover:border-red-300'
                                }`}
                            alt={`Miniatura ${idx + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {isLightboxOpen && selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        {/* Flecha izquierda */}
                        {selectedIndex > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedIndex((prev) => prev - 1);
                                }}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center text-2xl"
                            >
                                ‹
                            </button>
                        )}

                        {/* Imagen con zoom */}
                        <div className="overflow-auto max-h-[90vh] max-w-[90vw]">
                            <img
                                src={selectedImage}
                                alt="Vista ampliada"
                                className="object-contain rounded-lg shadow-2xl transition-transform duration-300"
                            />
                        </div>

                        {/* Flecha derecha */}
                        {selectedIndex < allImages.length - 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedIndex((prev) => prev + 1);
                                }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center text-2xl"
                            >
                                ›
                            </button>
                        )}

                        {/* Botón cerrar */}
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center text-xl"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleImageGallery;
