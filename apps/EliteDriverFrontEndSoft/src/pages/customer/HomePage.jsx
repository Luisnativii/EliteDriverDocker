import MainHomeSection from '../../components/customer/MainHomeSection';
import MainInfoSection from '../../components/customer/MainInfoSection';
import AvailableVehiclesSection from '../../components/customer/AvailableVehiclesSection';
import { MainHomeSectionMobile } from '@/components/customer/MainHomeSectionMobile.jsx';
import MainInfoSectionMobile from '../../components/customer/MainInfoSectionMobile';
import SiteFooter from '../../components/layout/SiteFooter';

const HomePage = () => {
  return (
    <>
      {/* Portada y datos */}
      <div className="hidden lg:block">
        <MainHomeSection />
        <MainInfoSection />
      </div>
      <div className="lg:hidden">
        <MainHomeSectionMobile />
        <MainInfoSectionMobile />
      </div>

      {/* Vehículos reales disponibles para reservar.
          Antes eran tres imágenes fijas por categoría; ahora lista la flota y
          filtra por las fechas que la persona eligió arriba. */}
      <AvailableVehiclesSection />

      {/* Pie con los enlaces legales: la ley exige que el aviso de privacidad
          sea accesible desde el sitio, así que va en la página principal. */}
      <SiteFooter />
    </>
  );
};

export default HomePage;