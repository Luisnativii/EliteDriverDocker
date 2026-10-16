import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import { DateProvider } from './context/DateContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';
const DashboardPage = React.lazy(() => import('./pages/admin/DashboardPage'));
const MaintenancePage = React.lazy(() => import('./pages/admin/MaintenancePage'));
const ReservationManagementPage = React.lazy(() => import('./pages/admin/ReservationManagementPage'));
const VehicleManagementPage = React.lazy(() => import('./pages/admin/VehicleManagementPage'));
const HomePage = React.lazy(() => import('./pages/customer/HomePage'));
const MyReservationPage = React.lazy(() => import('./pages/customer/MyReservationsPage'));
const ReservationPage = React.lazy(() => import('./pages/customer/ReservationPage'));
const VehiclesPage = React.lazy(() => import('./pages/customer/VehiclesPage'));
const Login = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const VehicleTypeDetailPage = React.lazy(() => import('./pages/customer/VehicleTypeDetailPage'));
const InformacionPage = React.lazy(() => import('./pages/InformacionPage'));
const PrivacidadPage = React.lazy(() => import('./pages/legal/PrivacidadPage'));
const TerminosPage = React.lazy(() => import('./pages/legal/TerminosPage'));
const CookiesPage = React.lazy(() => import('./pages/legal/CookiesPage'));
const LegalPage = React.lazy(() => import('./pages/legal/LegalPage'));
import { Outlet } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const App = () => (
  <Router>
    <AuthProvider>
      <DateProvider>
        <React.Suspense fallback={<div role="status" className="min-h-dvh bg-neutral-900 text-white p-6 pt-24">Cargando…</div>}>
        <Routes>
          {/* Rutas públicas sin necesidad de login */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/customer/vehicles" element={<VehiclesPage />} />
            <Route path="/customer/vehicle-type/:vehicleType" element={<VehicleTypeDetailPage />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Información y documentos legales: públicos, sin sesión.
              El artículo 16(g) de la Ley para la Protección de Datos Personales
              exige que el aviso de privacidad esté publicado en el sitio web. */}
          <Route path="/informacion" element={<InformacionPage />} />
          <Route path="/informacion/privacidad" element={<PrivacidadPage />} />
          <Route path="/informacion/terminos" element={<TerminosPage />} />
          <Route path="/informacion/cookies" element={<CookiesPage />} />
          <Route path="/informacion/legal" element={<LegalPage />} />

          {/* Layout común (sidebar dinámico según estado de login) */}
          <Route element={<Layout />}>
            {/* Rutas protegidas ADMIN */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <Outlet />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardPage />} />
              <Route path="maintenance" element={<MaintenancePage />} />
              <Route path="reservation" element={<ReservationManagementPage />} />
              <Route path="vehicle" element={<VehicleManagementPage />} />
            </Route>

            {/* Rutas protegidas CUSTOMER */}
            <Route path="/customer" element={
              <ProtectedRoute requiredRole="customer">
                <Outlet />
              </ProtectedRoute>
            }>
              <Route index element={<HomePage />} />
              <Route path="my-reservations" element={<MyReservationPage />} />
              <Route path="reservation-page/:vehicleId" element={<ReservationPage />} />
            </Route>
          </Route>

          {/* Redirección si no se encuentra ruta */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </React.Suspense>

      </DateProvider>
    </AuthProvider>
    <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="dark" />
  </Router>
);

export default App;