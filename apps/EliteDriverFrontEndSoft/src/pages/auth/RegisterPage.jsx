import React from 'react';
import { useNavigate } from "react-router-dom";
import RegisterForm from "../../components/forms/RegisterForm";

const RegisterPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegistrationSuccess = () => {
    //console.log('Usuario registrado exitosamente');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-y-auto scrollbar-show">
      {/* Imagen de fondo con overlay opaco */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl"></div>

      {/* Contenido principal */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-2">
          <div className='flex justify-center mt-4'>
            <img
              src="/EliteDrive.svg"
              alt="EliteDrive Logo"
              className="h-12 w-auto invert md:h-16 sm:h-12 lg:h-18"
            />
          </div>
        </div>

        {/* Formulario de registro */}
        <RegisterForm onLoginClick={handleLoginClick}
        onRegistrationSuccess={handleRegistrationSuccess} />

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/50 text-xs">
            2025 EliteDrive. N-Capas equipo Asesuisa.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;