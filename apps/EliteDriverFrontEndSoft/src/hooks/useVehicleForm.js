import { useState, useCallback } from "react";

export const useVehicleForm = (initialData = {}, isEditMode = false) => {

  const getInitialFormData = () => ({
    // Datos básicos
    name: initialData.name || "",
    brand: initialData.brand || "",
    model: initialData.model || "",
    capacity: initialData.capacity?.toString() || "",
    vehicleType: initialData.vehicleType || initialData.type || "",
    pricePerDay: initialData.pricePerDay?.toString() || "",
    kilometers: initialData.kilometers?.toString() || "",
    kmForMaintenance: initialData.kmForMaintenance?.toString() || "",
    insurancePhone: initialData.insurancePhone || "",

    // Características
    features: Array.isArray(initialData.features) ? initialData.features : [],
    featuresText:
      Array.isArray(initialData.features)
        ? initialData.features.join(", ")
        : "",

    // IMÁGENES (Nuevo formato Base64)
    mainImageBase64: initialData.mainImageBase64 || null,
    listImagesBase64: Array.isArray(initialData.listImagesBase64)
      ? initialData.listImagesBase64
      : [],

    status: initialData.status || "maintenanceCompleted",
  });

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});

  // --------------------------------------------
  // HANDLE CHANGE - para inputs normales
  // --------------------------------------------
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      if (
        name === "capacity" ||
        name === "kilometers" ||
        name === "kmForMaintenance"
      ) {
        const numericValue = value.replace(/\D/g, "");
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      } else if (name === "pricePerDay") {
        const numericValue = value.replace(/[^\d.]/g, "");
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }

      // limpiar error mientras escribe
      setErrors((prev) => {
        if (prev[name]) {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        }
        return prev;
      });
    },
    [setFormData, setErrors]
  );

  // --------------------------------------------
  // VALIDACIONES
  // --------------------------------------------
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    if (!formData.brand.trim()) newErrors.brand = "La marca es requerida";
    if (!formData.model.trim()) newErrors.model = "El modelo es requerido";

    if (!formData.capacity)
      newErrors.capacity = "La capacidad es requerida";
    else if (parseInt(formData.capacity) < 1)
      newErrors.capacity = "La capacidad debe ser mayor a 0";

    if (!formData.vehicleType)
      newErrors.vehicleType = "El tipo de vehículo es requerido";

    if (!formData.pricePerDay)
      newErrors.pricePerDay = "El precio por día es requerido";
    else if (parseFloat(formData.pricePerDay) <= 0)
      newErrors.pricePerDay = "El precio debe ser mayor a 0";

    if (!formData.kilometers)
      newErrors.kilometers = "Los kilómetros son requeridos";

    if (!formData.kmForMaintenance)
      newErrors.kmForMaintenance = "Los KM para mantenimiento son requeridos";

    if (!formData.featuresText.trim())
      newErrors.features = "Debes incluir al menos una característica";

    // VALIDACIÓN NUEVA PARA BASE64
    if (!formData.mainImageBase64)
      newErrors.mainImageBase64 = "La imagen principal es requerida";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // --------------------------------------------
  // RESET FORM
  // --------------------------------------------
  const resetForm = useCallback(() => {
    setFormData(getInitialFormData());
    setErrors({});
  }, []);

  // --------------------------------------------
  // CREACIÓN DE PAYLOAD LISTO PARA BACKEND
  // --------------------------------------------
  const getSubmissionData = useCallback(() => {
    return {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      vehicleType: formData.vehicleType,
      capacity: parseInt(formData.capacity),
      pricePerDay: parseFloat(formData.pricePerDay),
      kilometers: parseInt(formData.kilometers),
      kmForMaintenance: parseInt(formData.kmForMaintenance),
      insurancePhone: formData.insurancePhone.trim(),
      features: formData.featuresText
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f !== ""),

      // IMÁGENES BASE64
      mainImageBase64: formData.mainImageBase64,
      listImagesBase64: formData.listImagesBase64,
    };
  }, [formData]);

  return {
    formData,
    errors,
    handleChange,
    validateForm,
    resetForm,
    setFormData,
    setErrors,
    getSubmissionData,
  };
};
