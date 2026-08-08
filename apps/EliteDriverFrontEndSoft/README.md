# EliteDrive — Frontend

## Equipo: Asesuisa

Este es el repositorio del frontend de **EliteDrive**, una aplicación web para la reserva y gestión de vehículos. El sistema permite a los usuarios alquilar autos disponibles y a los administradores gestionar el inventario, mantenimiento y reservas de manera centralizada.

---

## Descripción del Proyecto

Es un sistema web para gestionar y reservar vehículos en línea. Los usuarios pueden explorar el catálogo filtrando por características (marca, modelo, transmisión, año, combustible, precio por día, capacidad, tipo de vehículo), ver disponibilidad por rango de fechas y realizar reservas con cálculo automático del precio total según días.

El administrador gestiona el inventario (CRUD de vehículos), la disponibilidad (ocupado por reserva o por mantenimiento), las aseguradoras y un panel con alertas y vehículos alquilados.

**Recursos principales**: vehículo (póliza, aseguradora, contacto de emergencia, kilometraje), reserva, usuario, aseguradora, mantenimiento.  
**Roles**: Administrador y Cliente.  

---


## Demo

https://elite-driver-soft.vercel.app

---

## 🛠️ Tecnologías utilizadas

| Capa             | Tecnología usada     |
|------------------|----------------------|
| **Frontend**     | React.js             |
| **Backend**      | Spring Boot (Java)   |
| **Base de datos**| PostgreSQL           |


---

## Requisitos Previos:

Para ejecutar la aplicación localmente, asegúrate de tener los siguientes requisitos previos:

1. **Node.js** (v16 o superior) instalado.
2. **npm** (v7 o superior) para la instalación de dependencias.
3. **Vite** para la construcción y desarrollo de la aplicación.

---

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/PNC-012025/pnc-proyecto-final-frontend-grupo-04-s01.git
cd pnc-proyecto-final-frontend-grupo-04-s01
cd elite-drive-client
code .
```

2. Instala las dependencias:

```bash
npm install
npm install react-big-calendar date-fns
npm install react-toastify
```

3. Inicia la aplicación:

```bash
npm run dev
# o
npm start
```

---
## Variables de entorno
Para hacer funcionar la aplicación localmente, asegúrate de configurar correctamente el archivo .env con las siguientes variables:
```bash
VITE_API_BASE_URL=http://localhost:8080/api
```
Este archivo es fundamental para conectar el frontend con el backend local.


## Usuarios de prueba

### Administrador

- **Email:** `admin@example.com`  
- **Contraseña:** `adminadmin`  

El administrador puede:

- Gestionar vehículos (CRUD)
- Ver todas las reservas
- Administrar mantenimientos
- Consultar alertas de mantenimiento

###  Cliente (Usuario)

Para acceder como cliente, **debes registrarte** mediante el formulario de registro disponible en la web.

Los usuarios pueden:

- Visualizar vehículos disponibles
- Filtrar por características (marca, modelo, capacidad, etc.)
- Realizar reservas indicando fecha de inicio y fin
- Ver el precio total calculado automáticamente

---

##  Funcionalidades principales

- Visualización y filtrado de vehículos
- Registro y login de usuarios con JWT
- Sistema de reservas con calendario interactivo
- Gestión de mantenimientos
- Gestión de reservas
- Gestión de vehículos
- Visualización de alertas de mantenimiento
- Interfaz intuitiva y responsiva

---

##  Estructura del repositorio

```
elite-drive-frontend/
├── src/
│   ├── assets/
|   │   ├── jpg/
|   │   ├── png/
│   ├── components/
|   │   ├── admin/
|   │   ├── common/
|   │   ├── customer/
|   │   ├── forms/
|   │   ├── layout/
|   │   ├── reservation/
|   │   ├── ui/
|   │   ├── vehicle/
│   ├── config/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
|   │   ├── admin/
|   │   ├── auth/
|   │   ├── customer/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── public/
├── .env
├── tailwind.config.js
├── vite.config.js
└── package.json
```


##  Notas adicionales

- El calendario de reservas utiliza [`react-big-calendar`](https://github.com/jquense/react-big-calendar) y está integrado con `date-fns` para localización en español.
- Las notificaciones están integradas mediante [`react-toastify`](https://fkhadra.github.io/react-toastify/).

---

## 📜 Licencia

Este proyecto es parte del curso **Ingenieria de software - Ciclo 02-25** y se encuentra bajo fines académicos.
