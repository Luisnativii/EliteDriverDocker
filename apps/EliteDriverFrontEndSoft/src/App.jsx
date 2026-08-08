import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import { DateProvider } from './context/DateContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/admin/DashboardPage';
import MaintenancePage from './pages/admin/MaintenancePage';
import ReservationManagementPage from './pages/admin/ReservationManagementPage';
import VehicleManagementPage from './pages/admin/VehicleManagementPage';
import HomePage from './pages/customer/HomePage';
import MyReservationPage from './pages/customer/MyReservationsPage';
import ReservationPage from './pages/customer/ReservationPage';
import VehiclesPage from './pages/customer/VehiclesPage';
import Login from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VehicleTypeDetailPage from './pages/customer/VehicleTypeDetailPage';
import { Outlet } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const App = () => (
  <Router>
    <AuthProvider>
      <DateProvider>
        <Routes>
          {/* Rutas públicas sin necesidad de login */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/customer/vehicles" element={<VehiclesPage />} />
            <Route path="/customer/vehicle-type/:vehicleType" element={<VehicleTypeDetailPage />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />

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

      </DateProvider>
    </AuthProvider>
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="dark" />
  </Router>
);

export default App;