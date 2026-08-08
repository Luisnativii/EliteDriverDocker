import CarroInfoPrincipal from '../../assets/jpg/CarroInfoPrincipal.jpg';

const MainInfoSectionMobile = () =>{

return(

     <section className="bg-white py-20 px-8 lg:px-16">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Lado izquierdo - Imagen */}
                    <div className="relative">
                        <div className="rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src={CarroInfoPrincipal}
                                alt="Descripción de la imagen"
                                className="w-full h-[400px] object-cover"
                            />
                        </div>
                        {/* Elemento decorativo opcional */}
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-100 rounded-full -z-10"></div>
                    </div>

                    {/* Lado derecho - Información */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Recibe tu auto donde lo necesites
                            </h2>
                            <div className="w-20 h-1 bg-red-600 mb-6"></div>
                        </div>

                        <p className="text-lg text-gray-600 leading-relaxed">
                            Libertad para moverte a tu ritmo. Elige tu vehículo ideal y lo entregamos donde lo necesites (casa, hotel, oficina). Sin filas ni complicaciones.
                        </p>

                        <p className="text-lg text-gray-600 leading-relaxed">
                            Con solo unos clics, podrás reservar un auto y tenerlo listo en minutos.
                            Nos encargamos de que la experiencia sea rápida, segura y sin papeleo innecesario
                        </p>

                        {/* Lista de características */}
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                <span className="text-gray-700">Sin filas, sin papeleo, sin complicaciones</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                <span className="text-gray-700">Recibe el auto y comienza tu viaje en minutos</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                <span className="text-gray-700">Y si necesitas ayuda, nuestro soporte 24/7 está  disponible</span>
                            </li>
                        </ul>

                    </div>
                </div>
            </div>
        </section>

);

};

export default MainInfoSectionMobile;