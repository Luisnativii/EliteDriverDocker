import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SUVImage from '../../assets/jpg/SUVOptionDetailPage.webp';
import SedanImage from '../../assets/jpg/SedanOptionDetailMain.png';
import PickUpImage from '../../assets/jpg/PickupDetailOption.jpg';
import VehicleHeader from '../../components/customer/DetailHeaderSection';
import DetailsSection from '../../components/customer/DetailSpecificationSection';
import CTASection from '../../components/customer/DetailCTASection';
import NoData from '../../components/customer/DetailNoDataSection';

const VehicleTypeDetailPage = () => {
    const { vehicleType } = useParams();
    const navigate = useNavigate();
    const [vehicleData, setVehicleData] = useState(null);


    // Configuración de datos para cada tipo de vehículo
    const vehicleConfig = {
        sedan: {
            title: 'Sedán',
            description: 'Elegancia y confort en cada viaje. Nuestros sedanes ofrecen la combinación perfecta entre estilo, eficiencia y comodidad.',
            image: SedanImage,
            features: [
                'Motor eficiente de combustible',
                'Interior espacioso y cómodo',
                'Tecnología avanzada de seguridad',
                'Diseño aerodinámico',
                'Sistema de entretenimiento moderno'
            ],
            specs: {
                'Capacidad': '5 pasajeros',
                'Transmisión': 'Automática/Manual',
                'Combustible': 'Gasolina/Híbrido',
                'Maletero': '500L aproximadamente'
            }
        },
        suv: {
            title: 'SUV',
            description: 'Versatilidad y potencia para todas tus aventuras. Perfecto para familias que buscan espacio, seguridad y capacidad todoterreno.',
            image: SUVImage,
            features: [
                'Tracción en las 4 ruedas disponible',
                'Amplio espacio interior',
                'Mayor altura de manejo',
                'Capacidad de remolque',
                'Sistemas de seguridad avanzados'
            ],
            specs: {
                'Capacidad': '7-8 pasajeros',
                'Transmisión': 'Automática',
                'Combustible': 'Gasolina/Diesel/Híbrido',
                'Traccion': '2x2/4x4'
            }
        },
        pickup: {
            title: 'Pickup',
            description: 'La combinación perfecta entre trabajo y placer. Diseñado para quienes necesitan potencia, durabilidad y versatilidad.',
            image: PickUpImage,
            features: [
                'Caja de carga resistente',
                'Motor potente y confiable',
                'Capacidad de remolque superior',
                'Cabina cómoda',
                'Tracción 4x4 disponible'
            ],
            specs: {
                'Capacidad': '2-5 pasajeros',
                'Transmisión': 'Manual/Automática',
                'Combustible': 'Gasolina/Diesel',
                'Traccion': '4x2/4x4'
            }
        }
    };

    useEffect(() => {
        
        if (vehicleType && vehicleConfig[vehicleType]) {
            setVehicleData(vehicleConfig[vehicleType]);
        }
    }, [vehicleType]);

    const handleBackToHome = () => {
        
        navigate('/customer');
    };

    const handleViewVehicles = () => {
        navigate('/customer/vehicles');
    };

    const handleReserve = () => {
        navigate('/customer/reservation-page');
    }

    if (!vehicleData) {
        return (
            <NoData
                onBack={handleBackToHome}
            />
        );
    }
    return (
        <div className="min-h-screen bg-neutral-100 font-montserrat">
            {/* Header Section */}
            <VehicleHeader vehicleData={vehicleData} onBack={handleBackToHome} />
            {/* Specifications Section */}
            <DetailsSection specs={vehicleData.specs} />
            {/* CTA Section */}
            <CTASection
                title={vehicleData.title}
                onViewVehicles={handleViewVehicles}
                onReserve={handleReserve}
            />

        </div>
    );
}

export default VehicleTypeDetailPage;