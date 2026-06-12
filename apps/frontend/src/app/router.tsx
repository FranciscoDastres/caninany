import { createBrowserRouter, Navigate } from "react-router-dom";

import { AuthGuard } from "@/core/auth/auth-guard";
import { AdminDashboard } from "@/features/admin-dashboard/components/admin-dashboard";
import { AppointmentsPage } from "@/features/appointments/pages/appointments-page";

import { RootLayout } from "./root-layout";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <AppointmentsPage /> },
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
