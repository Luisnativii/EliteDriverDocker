// components/forms/RegisterForm.jsx
import React, { useState } from 'react';
import { useRegister } from '../../hooks/useRegister';

/**
 * Componente del formulario de registro de usuario.
 * Permite al usuario crear una nueva cuenta proporcionando su información personal y credenciales.
 * 
 * @param {function} onLoginClick - Función que se ejecuta cuando el usuario hace clic en "Ya tengo una cuenta" para redirigir al login.
 */

const RegisterForm = ({ onLoginClick }) => {
  const {
    formData,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
    resetForm
  } = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  //fecha maxima
  const today = new Date();
  today.setDate(today.getDate() - 1); // Restar 1 día para que hoy no sea válido
  const maxBirthDate = today.toISOString().split('T')[0];

  //fehca minima
   const minBirthDate = '1900-01-01';


  /**
   * Función para manejar el éxito del registro.
   * Muestra un mensaje de éxito por unos segundos y luego redirige al login.
   *
   * @param {Object} response - Respuesta del servicio de registro.
   */

  const handleRegistrationSuccess = (response) => {
    setRegistrationSuccess(true);

    // Mostrar mensaje de éxito por unos segundos
    setTimeout(() => {
      setRegistrationSuccess(false);
      // Opcional: redirigir automáticamente al login
      if (onLoginClick) {
        onLoginClick();
      }
    }, 3000);
  };

  /**
   * Función que maneja el envío del formulario de registro.
   * Llama al hook de `handleSubmit` para ejecutar la lógica de validación y registro.
   *
   * @param {Event} e - Evento de envío del formulario.
   */
  
  const onSubmit = (e) => {
    handleSubmit(e, handleRegistrationSuccess);
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-light text-white mb-2">Crear cuenta</h2>
        <p className="text-white/70 text-sm">Completa la información para registrarte</p>
      </div>

      {/* Mensaje de éxito */}
      {registrationSuccess && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
          <p className="text-green-300 text-center font-medium">
            ¡Registro exitoso! Redirigiendo al login...
          </p>
        </div>
      )}

      {/* Error general */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-300 text-center">{errors.submit}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-white/90 text-sm font-medium" htmlFor="firstName">
              Nombre *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full p-3 bg-white/5 backdrop-blur-sm border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 ${errors.firstName
                ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                : 'border-white/20 focus:ring-red-500/50 focus:border-red-500/50'
                }`}
              placeholder="Tu nombre"
              required
              disabled={isLoading}
            />
            {errors.firstName && (
              <p className="text-red-300 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-white/90 text-sm font-medium" htmlFor="lastName">
              Apellido *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full p-3 bg-white/5 backdrop-blur-sm border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 ${errors.lastName
                ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                : 'border-white/20 focus:ring-red-500/50 focus:border-red-500/50'
                }`}
              placeholder="Tu apellido"
              required
              disabled={isLoading}
            />
            {errors.lastName && (
              <p className="text-red-300 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Fecha de nacimiento */}
        <div className="space-y-2">
          <label className="block text-white/90 text-sm font-medium" htmlFor="birthDate">
            Fecha de nacimiento *
          </label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            max={maxBirthDate}
            min={minBirthDate}
            onChange={handleChange}
            className={`w-full p-3 bg-white/5 backdrop-blur-sm border rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-300 ${errors.birthDate
              ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
              : 'border-white/20 focus:ring-red-500/50 focus:border-red-500/50'
              }`}
            required
            disabled={isLoading}
          />
          {errors.birthDate && (
            <p className="text-red-300 text-xs mt-1">{errors.birthDate}</p>
          )}
        </div>

        {/* DUI y Teléfono */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-white/90 text-sm font-medium" htmlFor="dui">
              DUI *
            </label>
            <input
              type="text"
              name="dui"
              value={formData.dui}
              onChange={handleChange}
              className={`w-full p-3 bg-white/5 backdrop-blur-sm border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 ${errors.dui
                ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                : 'border-white/20 focus:ring-red-500/50 focus:border-red-500/50'
                }`}
              placeholder="123456789 (sin guión)"
              maxLength="9"
              required
              disabled={isLoading}
            />
            {errors.dui && (
              <p className="text-red-300 text-xs mt-1">{errors.dui}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-white/90 text-sm font-medium" htmlFor="phoneNumber">
              Número de teléfono *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`w-full p-3 bg-white/5 backdrop-blur-sm border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 ${errors.phoneNumber
                ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                : 'border-white/20 focus:ring-red-500/50 focus:border-red-500/50'
                }`}
              placeholder="12345678 (sin guión)"
              maxLength="8"
              required
              disabled={isLoading}
            />
            {errors.phoneNumber && (
              <p className="text-red-300 text-xs mt-1">{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-white/90 text-sm font-medium" htmlFor="email">
            Correo electrónico *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-3 bg-white/5 backdrop-blur-sm border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 ${errors.email
              ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
              : 'border-white/20 focus:ring-red-500/50 focus:border-red-500/50'
              }`}
            placeholder="tu@email.com"
            required
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-300 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Contraseñas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-white/90 text-sm font-medium" htmlFor="password">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 bg-white/5 backdrop-blur-sm border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 ${errors.password
                ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                : 'border-white/20 focus:ring-red-500/50 focus:border-red-500/50'
                }`}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-300 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-white/90 text-sm font-medium" htmlFor="confirmPassword">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full p-3 bg-white/5 backdrop-blur-sm border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 ${errors.confirmPassword
                ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                : 'border-white/20 focus:ring-red-500/50 focus:border-red-500/50'
                }`}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-red-300 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || registrationSuccess}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 mb-0 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-3 w-5 border-b-2 border-white mr-2"></div>
              Registrando...
            </div>
          ) : (
            'Crear cuenta'
          )}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-transparent text-white/60">o</span>
          </div>
        </div>

        <button
          onClick={onLoginClick}
          type="button"
          disabled={isLoading}
          className="w-full bg-white/5 backdrop-blur-sm border border-white/20 text-white py-3 rounded-xl font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 disabled:opacity-50"
        >
          Ya tengo una cuenta
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;