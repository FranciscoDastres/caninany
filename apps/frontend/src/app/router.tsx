import { createBrowserRouter, Navigate } from "react-router-dom";

import { AuthGuard } from "@/core/auth/auth-guard";
import { AdminDashboard } from "@/features/admin-dashboard/components/admin-dashboard";
import { AppointmentsPage } from "@/features/appointments/pages/appointments-page";
import { HomePage } from "@/features/marketing/pages/home-page";

import { RootLayout } from "./root-layout";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "agendar", element: <AppointmentsPage /> },
      {
        path: "admin",
        element: (
          <AuthGuard role="admin">
            <AdminDashboard />
          </AuthGuard>
        ),
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
