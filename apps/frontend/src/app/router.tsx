import { createBrowserRouter, Navigate } from "react-router-dom";

import { PrivateRoute } from "@/core/auth/private-route";
import { AdminDashboard } from "@/features/admin-dashboard/components/admin-dashboard";
import { AppointmentsPage } from "@/features/appointments/pages/appointments-page";
import { LoginPage } from "@/features/auth/pages/login-page";
import { RegisterPage } from "@/features/auth/pages/register-page";
import { ClientProfilePage } from "@/features/client-profile/pages/client-profile-page";
import { HomePage } from "@/features/marketing/pages/home-page";

import { RootLayout } from "./root-layout";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "agendar", element: <AppointmentsPage /> },
      { path: "ingresar", element: <LoginPage /> },
      { path: "registro", element: <RegisterPage /> },
      {
        path: "perfil",
        element: (
          <PrivateRoute role="cliente">
            <ClientProfilePage />
          </PrivateRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        ),
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
