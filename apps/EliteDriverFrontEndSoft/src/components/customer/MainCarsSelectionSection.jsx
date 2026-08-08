import { useNavigate } from 'react-router-dom';
import SUVImage from '../../assets/png/SUVOptionMain.png';
import SedanImage from '../../assets/png/SedanOptionMain.png';
import PickUpImage from '../../assets/png/PickupOptionMain.png';

const MainCarsSelectionSection = () => {
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

            <section className="px-40 lg:px-80">
                <div className="space-y-16">
                    {/* Tipo Sedán */}
                    <div className="flex items-center justify-between gap-8 flex-wrap">
                        {/* Bloque izquierdo: texto + flecha */}
                        <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-semibold">Descubre sedán</h3>

                            <button onClick={handleSedanClick}
                            
                                className="w-8 h-8 border border-white rounded-full flex items-center justify-center hover:bg-white hover:text-neutral-600 transition-colors duration-300 cursor-pointer"
                            >
                                <span className="text-lg">{'>'}</span>
                            </button>


                        </div>
                        {/* Imagen */}
                        <img src={SedanImage} alt="Sedán" className="w-[340px] md:w-[420px] object-contain" />
                    </div>
                    <div className="w-full h-px bg-white opacity-30"></div>

                    {/* Tipo SUV */}
                    <div className="flex items-center justify-between gap-8 flex-wrap">
                        <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-semibold">Descubre SUV</h3>
                            <button onClick={handleSUVClick}
                                className="w-8 h-8 border border-white rounded-full flex items-center justify-center hover:bg-white hover:text-neutral-600 transition-colors duration-300 cursor-pointer"
                            >
                                <span className="text-lg">{'>'}</span>
                            </button>
                        </div>
                        <img src={SUVImage} alt="SUV" className="w-[340px] md:w-[420px] object-contain" />
                    </div>
                    <div className="w-full h-px bg-white opacity-30"></div>


                    {/* Tipo pickup */}
                    <div className="flex items-center justify-between gap-8 flex-wrap">
                        <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-semibold">Descubre pickup</h3>
                            <button onClick={handlePickupClick}
                                className="w-8 h-8 border border-white rounded-full flex items-center justify-center hover:bg-white hover:text-neutral-600 transition-colors duration-300 cursor-pointer"
                            >
                                <span className="text-lg">{'>'}</span>
                            </button>
                        </div>
                        <img src={PickUpImage} alt="SUV" className="w-[340px] md:w-[420px] object-contain" />
                    </div>
                </div>


            </section>



        </section>
    );



}


export default MainCarsSelectionSection;