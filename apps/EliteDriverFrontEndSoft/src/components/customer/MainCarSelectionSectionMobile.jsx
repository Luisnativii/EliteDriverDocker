import { useNavigate } from 'react-router-dom';
import SUVImage from '../../assets/png/SUVOptionMain.png';
import SedanImage from '../../assets/png/SedanOptionMain.png';
import PickUpImage from '../../assets/png/PickupOptionMain.png';

const MainCarsSelectionSectionMobile = () => {
    const navigate = useNavigate();
    // Funciones para manejar los clicks de navegación
    const handleSedanClick = () => {

        navigate('/customer/vehicle-type/sedan');
    };

    const handleSUVClick = () => {

        navigate('/customer/vehicle-type/suv');

    };

    const handlePickupClick = () => {
        navigate('/customer/vehicle-type/pickup');

    };


    return (
        <section className="bg-neutral-600 text-white py-20  font-montserrat px-5 lg:px-5">
            {/* Título general */}
            <div className="flex items-center mb-16">
                <div className="w-20 h-px bg-white mr-4" />
                <h2 className="text-lg md:text-xl uppercase tracking-wide">
                    Descubre el vehículo perfecto para tu aventura
                </h2>
            </div>

            <section className="px-6 sm:px-10 md:px-20 lg:px-40 xl:px-80">
                <div className="space-y-8 md:space-y-16">
                    {/* Tipo Sedán */}
                    <div className="flex items-center gap-4 md:gap-8">
                        {/* Imagen */}
                        <img
                            src={SedanImage}
                            alt="Sedán"
                            className="w-32 sm:w-48 md:w-[340px] lg:w-[420px] object-contain flex-shrink-0"
                        />
                        {/* Bloque derecho: texto + flecha */}
                        <div className="flex items-center gap-3 md:gap-4">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold whitespace-nowrap">
                                Descubre sedán
                            </h3>
                            <button
                                onClick={handleSedanClick}
                                className="w-7 h-7 md:w-8 md:h-8 border border-white rounded-full flex items-center justify-center hover:bg-white hover:text-neutral-600 transition-colors duration-300 cursor-pointer flex-shrink-0"
                            >
                                <span className="text-base md:text-lg">{'>'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="w-full h-px bg-white opacity-30"></div>

                    {/* Tipo SUV */}
                    <div className="flex items-center gap-4 md:gap-8">
                        {/* Imagen */}
                        <img
                            src={SUVImage}
                            alt="SUV"
                            className="w-32 sm:w-48 md:w-[340px] lg:w-[420px] object-contain flex-shrink-0"
                        />
                        {/* Bloque derecho: texto + flecha */}
                        <div className="flex items-center gap-3 md:gap-4">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold whitespace-nowrap">
                                Descubre SUV
                            </h3>
                            <button
                                onClick={handleSUVClick}
                                className="w-7 h-7 md:w-8 md:h-8 border border-white rounded-full flex items-center justify-center hover:bg-white hover:text-neutral-600 transition-colors duration-300 cursor-pointer flex-shrink-0"
                            >
                                <span className="text-base md:text-lg">{'>'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="w-full h-px bg-white opacity-30"></div>

                    {/* Tipo pickup */}
                    <div className="flex items-center gap-4 md:gap-8">
                        {/* Imagen */}
                        <img
                            src={PickUpImage}
                            alt="Pickup"
                            className="w-32 sm:w-48 md:w-[340px] lg:w-[420px] object-contain flex-shrink-0"
                        />
                        {/* Bloque derecho: texto + flecha */}
                        <div className="flex items-center gap-3 md:gap-4">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold whitespace-nowrap">
                                Descubre pickup
                            </h3>
                            <button
                                onClick={handlePickupClick}
                                className="w-7 h-7 md:w-8 md:h-8 border border-white rounded-full flex items-center justify-center hover:bg-white hover:text-neutral-600 transition-colors duration-300 cursor-pointer flex-shrink-0"
                            >
                                <span className="text-base md:text-lg">{'>'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>



        </section>
    );



}


export default MainCarsSelectionSectionMobile;