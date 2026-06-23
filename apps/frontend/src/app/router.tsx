import { createBrowserRouter, Navigate } from "react-router-dom";

import { PrivateRoute } from "@/core/auth/private-route";
import { AboutPage } from "@/features/marketing/pages/about-page";
import { HomePage } from "@/features/marketing/pages/home-page";

import { RootLayout } from "./root-layout";
import { RouteFallback } from "./route-fallback";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    HydrateFallback: RouteFallback,
    children: [
      { index: true, element: <HomePage /> },
      { path: "nosotros", element: <AboutPage /> },
      {
        path: "agendar",
        lazy: async () => {
          const { AppointmentsPage } =
            await import("@/features/appointments/pages/appointments-page");
          return { Component: AppointmentsPage };
        },
      },
      {
        path: "ingresar",
        lazy: async () => {
          const { LoginPage } =
            await import("@/features/auth/pages/login-page");
          return { Component: LoginPage };
        },
      },
      {
        path: "registro",
        lazy: async () => {
          const { RegisterPage } =
            await import("@/features/auth/pages/register-page");
          return { Component: RegisterPage };
        },
      },
      {
        path: "verificar-correo",
        lazy: async () => {
          const { VerifyEmailPage } =
            await import("@/features/auth/pages/verify-email-page");
          return { Component: VerifyEmailPage };
        },
      },
      {
        path: "recuperar-contrasena",
        lazy: async () => {
          const { ForgotPasswordPage } =
            await import("@/features/auth/pages/forgot-password-page");
          return { Component: ForgotPasswordPage };
        },
      },
      {
        path: "restablecer-contrasena",
        lazy: async () => {
          const { ResetPasswordPage } =
            await import("@/features/auth/pages/reset-password-page");
          return { Component: ResetPasswordPage };
        },
      },
      {
        path: "perfil",
        lazy: async () => {
          const { ClientProfilePage } =
            await import("@/features/client-profile/pages/client-profile-page");

          return {
            Component: function ClientProfileRoute() {
              return (
                <PrivateRoute role="cliente">
                  <ClientProfilePage />
                </PrivateRoute>
              );
            },
          };
        },
      },
      {
        path: "admin",
        lazy: async () => {
          const { AdminDashboard } =
            await import("@/features/admin-dashboard/components/admin-dashboard");

          return {
            Component: function AdminRoute() {
              return (
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              );
            },
          };
        },
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
