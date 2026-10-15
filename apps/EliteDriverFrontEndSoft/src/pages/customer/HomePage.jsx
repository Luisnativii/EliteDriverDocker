import MainHomeSection from '../../components/customer/MainHomeSection';
import MainInfoSection from '../../components/customer/MainInfoSection';
import MainCarsSelectionSection from '../../components/customer/MainCarsSelectionSection';
import { MainHomeSectionMobile } from '@/components/customer/MainHomeSectionMobile.jsx';
import MainInfoSectionMobile from '../../components/customer/MainInfoSectionMobile';
import MainCarsSelectionSectionMobile from '../../components/customer/MainCarSelectionSectionMobile';
import SiteFooter from '../../components/layout/SiteFooter';

const HomePage = () => {
  return (
    <>
      <div className="hidden lg:block">
        <MainHomeSection />
        <MainInfoSection />
        <MainCarsSelectionSection />
      </div>
      <div className="lg:hidden">
        <MainHomeSectionMobile />
        <MainInfoSectionMobile />
        <MainCarsSelectionSectionMobile />
      </div>

      {/* Pie con los enlaces legales: la ley exige que el aviso de privacidad
          sea accesible desde el sitio, así que va en la página principal. */}
      <SiteFooter />
    </>
  );
};

export default HomePage;