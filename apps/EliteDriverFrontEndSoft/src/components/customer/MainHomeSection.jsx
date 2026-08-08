import CarroPaginaHomeBanner from '../../assets/jpg/CarroPaginaHomeBanner.jpg';
import DateForm from '../../components/forms/DateForm';

const MainHomeSection = () => {
    return (
        <section
            className="relative min-h-screen bg-cover bg-center flex items-center justify-between px-8 lg:px-16 font-montserrat"
            style={{ backgroundImage: `url(${CarroPaginaHomeBanner})` }}
        >
            {/* Overlay para mejorar legibilidad */}
            <div className="absolute inset-0 bg-black/30"></div>
            
            <div className="relative z-10 flex items-center justify-between w-full max-w-7xl mx-auto">
                {/* Lado izquierdo - Título y subtítulo */}
                <div className="text-left">
                    <h1 className="text-6xl lg:text-8xl font-extralight text-white mb-6 leading-tight">
                        <span className="block drop-shadow-2xl">ELITE</span>
                        <span className="block drop-shadow-2xl">DRIVE</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-white/90 drop-shadow-lg max-w-md">
                        Encuentra tu libertad en cada viaje
                    </p>
                </div>
                {/* Formulario de reserva con glassmorphism */}
                <DateForm variant="home" />
            </div>
        </section>
    );
}

export default MainHomeSection;