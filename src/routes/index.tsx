import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { ROLES, ROUTES } from "../config/constants";

import AuthGuard from "./guards/AuthGuard";
import RoleGuard from "./guards/RoleGuard";
import Loader from "../components/common/Loader";

function Wrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loader fullScreen />}>{children}</Suspense>;
}

// ── Lazy imports ───────────────────────────────────────────
const Login = lazy(() => import("../features/auth/Login"));
const Register = lazy(() => import("../features/auth/Register"));
const ChangePassword = lazy(() => import("../features/auth/ChangePassword"));

const FarmerDashboard = lazy(() => import("../features/farmer/Dashboard"));
const FarmerProfile = lazy(() => import("../features/farmer/Profile"));
const AddFarm = lazy(() => import("../features/farmer/AddFarm"));

const AdminDashboard = lazy(() => import("../features/admin/Dashboard"));
const FarmersList = lazy(() => import("../features/admin/FarmersList"));

const AppLayout = lazy(() => import("../components/layout/AppLayout"));
const AdminLayout = lazy(() => import("../components/layout/AdminLayout"));

const router = createBrowserRouter([
  // ── Public ─────────────────────────────────────────────
  {
    path: ROUTES.LOGIN,
    element: (
      <Wrap>
        <Login />
      </Wrap>
    ),
  },
  {
    path: ROUTES.REGISTER,
    element: (
      <Wrap>
        <Register />
      </Wrap>
    ),
  },

  // ── Farmer routes ───────────────────────────────────────
  {
    element: <AuthGuard />,
    children: [
      {
        element: <RoleGuard allowedRole={ROLES.FARMER} />,
        children: [
          {
            element: (
              <Wrap>
                <AppLayout />
              </Wrap>
            ),
            children: [
              {
                path: ROUTES.FARMER_DASHBOARD,
                element: (
                  <Wrap>
                    <FarmerDashboard />
                  </Wrap>
                ),
              },
              {
                path: ROUTES.FARMER_PROFILE,
                element: (
                  <Wrap>
                    <FarmerProfile />
                  </Wrap>
                ),
              },
              {
                path: ROUTES.FARMER_ADD_FARM,
                element: (
                  <Wrap>
                    <AddFarm />
                  </Wrap>
                ),
              },
              {
                path: ROUTES.FARMER_CHANGE_PASSWORD,
                element: (
                  <Wrap>
                    <ChangePassword />
                  </Wrap>
                ),
              },
            ],
          },
        ],
      },
    ],
  },

  // ── Admin routes ────────────────────────────────────────
  {
    element: <AuthGuard />,
    children: [
      {
        element: <RoleGuard allowedRole={ROLES.ADMIN} />,
        children: [
          {
            element: (
              <Wrap>
                <AdminLayout />
              </Wrap>
            ),
            children: [
              {
                path: ROUTES.ADMIN_DASHBOARD,
                element: (
                  <Wrap>
                    <AdminDashboard />
                  </Wrap>
                ),
              },
              {
                path: ROUTES.ADMIN_FARMERS,
                element: (
                  <Wrap>
                    <FarmersList />
                  </Wrap>
                ),
              },
              {
                path: ROUTES.ADMIN_CHANGE_PASSWORD,
                element: (
                  <Wrap>
                    <ChangePassword />
                  </Wrap>
                ),
              },
            ],
          },
        ],
      },
    ],
  },

  // ── Fallback ────────────────────────────────────────────
  {
    path: "/",
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
  {
    path: "*",
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
