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

// ── Auth pages ─────────────────────────────────────────────
const Login = lazy(() => import("../features/auth/Login"));
const Register = lazy(() => import("../features/auth/Register"));
const ChangePassword = lazy(() => import("../features/auth/ChangePassword"));

// ── Farmer pages ───────────────────────────────────────────
const FarmerDashboard = lazy(() => import("../features/farmer/Dashboard"));
const FarmerProfile = lazy(() => import("../features/farmer/Profile"));
const AddFarm = lazy(() => import("../features/farmer/AddFarm"));
const AppLayout = lazy(() => import("../components/layout/AppLayout"));
const FarmerClaims = lazy(() => import("../features/farmer/Claims"));
const FarmerNewClaim = lazy(() => import("../features/farmer/NewClaim"));
const FarmCrops = lazy(() => import("../features/farmer/FarmCrops"));

// ── Admin pages ────────────────────────────────────────────
const AdminDashboard = lazy(() => import("../features/admin/Dashboard"));
const FarmersList = lazy(() => import("../features/admin/FarmersList"));
const AdminLayout = lazy(() => import("../components/layout/AdminLayout"));
const AdminAiAnalysis = lazy(
  () => import("../features/admin/AiAnalysis/index"),
);

// ── Agent pages ────────────────────────────────────────────
const AgentDashboard = lazy(() => import("../features/agent/Dashboard"));
const AgentProfile = lazy(() => import("../features/agent/Profile"));
const AgentClaims = lazy(() => import("../features/agent/Claims"));
const AgentClaimDetail = lazy(() => import("../features/agent/ClaimDetail"));
const AgentInspections = lazy(() => import("../features/agent/Inspections"));
const AgentFarmers = lazy(() => import("../features/agent/Farmers"));
const AgentLayout = lazy(() => import("../components/layout/AgentLayout"));

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

  // ── Farmer ─────────────────────────────────────────────
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
              {
                path: ROUTES.FARMER_CLAIMS, // now "/dashboard/claims" ✅
                element: (
                  <Wrap>
                    <FarmerClaims />
                  </Wrap>
                ),
              },
              {
                path: ROUTES.FARMER_NEW_CLAIM,
                element: (
                  <Wrap>
                    <FarmerNewClaim />
                  </Wrap>
                ),
              },
              {
                path: ROUTES.FARMER_FARM_CROPS, // now "/dashboard/farms/:farmId/crops" ✅
                element: (
                  <Wrap>
                    <FarmCrops />
                  </Wrap>
                ),
              },
            ],
          },
        ],
      },
    ],
  },

  // ── Admin ───────────────────────────────────────────────
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
                path: ROUTES.ADMIN_AI_ANALYSIS,
                element: (
                  <Wrap>
                    <AdminAiAnalysis />
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

  // ── Agent ───────────────────────────────────────────────
  {
    element: <AuthGuard />,
    children: [
      {
        element: <RoleGuard allowedRole={ROLES.INSURANCE_AGENT} />,
        children: [
          {
            element: (
              <Wrap>
                <AgentLayout />
              </Wrap>
            ),
            children: [
              {
                path: ROUTES.AGENT_DASHBOARD,
                element: (
                  <Wrap>
                    <AgentDashboard />
                  </Wrap>
                ),
              },
              {
                path: ROUTES.AGENT_PROFILE,
                element: (
                  <Wrap>
                    <AgentProfile />
                  </Wrap>
                ),
              },
              {
                path: ROUTES.AGENT_CLAIMS,
                element: (
                  <Wrap>
                    <AgentClaims />
                  </Wrap>
                ),
              },
              {
                path: "/agent/claims/:id",
                element: (
                  <Wrap>
                    <AgentClaimDetail />
                  </Wrap>
                ),
              },
              {
                path: ROUTES.AGENT_INSPECTIONS,
                element: (
                  <Wrap>
                    <AgentInspections />
                  </Wrap>
                ),
              },
              {
                path: ROUTES.AGENT_FARMERS,
                element: (
                  <Wrap>
                    <AgentFarmers />
                  </Wrap>
                ),
              },
              {
                path: ROUTES.AGENT_CHANGE_PASSWORD,
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
  { path: "/", element: <Navigate to={ROUTES.LOGIN} replace /> },
  { path: "*", element: <Navigate to={ROUTES.LOGIN} replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
