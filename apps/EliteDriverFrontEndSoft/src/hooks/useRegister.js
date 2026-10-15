// hooks/useRegister.js
import { useState } from 'react';
import { register } from '../services/authService';
import { validateRegistration, formatRegistrationForAPI, fieldErrorsFromResponse } from '../utils/registerValidation';

/**
 * Hook personalizado para gestionar el formulario de registro de un usuario.
 * Este hook maneja el estado del formulario, las validaciones, el envío de datos a la API
 * y el manejo de errores durante el proceso de registro.
 * 
 * @returns {Object} - Retorna un objeto con los datos del formulario, los errores, el estado de carga, las funciones para manejar el formulario y la validación.
 */

export const useRegister = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        dui: '',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Función para manejar los cambios en los campos del formulario.
     * Se encarga de actualizar el estado del formulario y manejar formateos especiales
     * para campos como el DUI y el número de teléfono.
     * 
     * @param {Event} e - El evento de cambio del formulario.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Formateo especial para DUI (solo números, máximo 9)
        if (name === 'dui') {
            const numericValue = value.replace(/\D/g, '').slice(0, 9);
            setFormData(prev => ({
                ...prev,
                [name]: numericValue
            }));
        }
        // Formateo especial para número de teléfono (solo números, máximo 8)
        else if (name === 'phoneNumber') {
            const numericValue = value.replace(/\D/g, '').slice(0, 8);
            setFormData(prev => ({
                ...prev,
                [name]: numericValue
            }));
        }
        else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Limpiar error específico cuando el usuario empieza a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = validateRegistration(formData);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Función para formatear los datos antes de enviarlos a la API.
     * Ajusta el formato del DUI y teléfono para que coincidan con lo esperado por el servidor.
     * 
     * @param {Object} data - Datos del formulario que se enviarán a la API.
     * @returns {Object} - Datos formateados correctamente para la API.
     */
    const formatDataForAPI = (data) => formatRegistrationForAPI(data);

    const handleSubmit = async (e, onSuccess) => {
        e.preventDefault();

        // Limpiar errores previos
        setErrors({});

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Formatear datos para la API
            const formattedData = formatDataForAPI(formData);
            // console.log('Datos formateados para API:', formattedData);

            // Llamar al servicio de registro
            const response = await register(formattedData);
            // console.log('Registro exitoso:', response);

            // Reset form después del éxito
            setFormData({
                firstName: '',
                lastName: '',
                birthDate: '',
                dui: '',
                phoneNumber: '',
                email: '',
                password: '',
                confirmPassword: ''
            });

            // Ejecutar callback de éxito si se proporciona
            if (onSuccess && typeof onSuccess === 'function') {
                onSuccess(response);
            }

        } catch (error) {
            // console.error('Error en el registro:', error);

            // El backend envía los motivos en `fields` (validación del DTO) o en
            // `error` (reglas de negocio). Se distribuyen al campo que corresponde
            // para que el usuario los vea junto a su input, en vez de un aviso genérico.
            setErrors(fieldErrorsFromResponse({
                fields: error.fields,
                error: error.message,
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            birthDate: '',
            dui: '',
            phoneNumber: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
        setErrors({});
    };

    return {
        formData,
        errors,
        isLoading,
        handleChange,
        handleSubmit,
        resetForm,
        validateForm,
        formatDataForAPI,
        setErrors
    };
};