import CarroPaginaHomeBanner from "@/assets/jpg/CarroPaginaHomeBanner.jpg";
import DateForm from "@/components/forms/DateForm.jsx";

export const MainHomeSectionMobile = () => {
  return(
      <>
          <section className="relative min-h-screen bg-cover bg-center flex items-center justify-between px-8 lg:px-16
           font-montserrat"
                   style={{ backgroundImage: `url(${CarroPaginaHomeBanner})` }}>
              {/* Overlay para mejorar legibilidad */}
              <div className="absolute inset-0 bg-black/30"></div>

              <div className="relative z-10 flex flex-col items-center justify-between w-full mx-auto">
                  {/* Lado izquierdo - Título y subtítulo */}
                  <div className="text-left ">
                      <h1 className="text-8xl font-extralight text-white flex flex-col items-center pb-4">
                          <span className="block w-full text-center tracking-widest">ELITE</span>
                          <span className="block w-full text-center">DRIVE</span>
                      </h1>
                      <p className="text-lg text-white/90 drop-shadow-lg max-w-md pb-6">
                          Encuentra tu libertad en cada viaje
                      </p>
                  </div>
                  {/* Formulario de reserva con glassmorphism */}
                  <DateForm variant="homeMobile" />
              </div>

          </section>
      </>
  )
}
