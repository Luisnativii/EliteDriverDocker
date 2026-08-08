import MainHomeSection from '../../components/customer/MainHomeSection' ;
import MainInfoSection from '../../components/customer/MainInfoSection' ;
import MainCarsSelectionSection from '../../components/customer/MainCarsSelectionSection';
import {MainHomeSectionMobile} from "@/components/customer/MainHomeSectionMobile.jsx";
import MainInfoSectionMobile from "@/components/customer/MainInfoSectionMobile.jsx";
import MainCarsSelectionSectionMobile from "@/components/customer/MainCarSelectionSectionMobile.jsx";


const HomePage = () => {
    return(
       <>
           <div className={"hidden lg:block"}>
               <MainHomeSection/>
               <MainInfoSection/>
               <MainCarsSelectionSection/>
           </div>
           <div className={"lg:hidden"}>
               <MainHomeSectionMobile/>
               <MainInfoSectionMobile/>
               <MainCarsSelectionSectionMobile/>
           </div>
       </>
    );
}

export default HomePage;