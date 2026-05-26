import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  User,
  Plus,
  KeyRound,
  LogOut,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Sprout,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../config/constants";
import { getInitials } from "../../lib/utils";
import { authService } from "../../services/auth.service";
import toast from "react-hot-toast";

const navItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: ROUTES.FARMER_DASHBOARD,
    end: true,
  },
  {
    label: "My Profile",
    icon: User,
    to: ROUTES.FARMER_PROFILE,
    end: false,
  },
  {
    label: "Add Farm",
    icon: Plus,
    to: ROUTES.FARMER_ADD_FARM,
    end: false,
  },
  {
    label: "Change Password",
    icon: KeyRound,
    to: ROUTES.FARMER_CHANGE_PASSWORD,
    end: false,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout, refreshToken } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      if (refreshToken) await authService.revokeToken(refreshToken);
    } catch {
      /* silent */
    } finally {
      logout();
      toast.success("Logged out successfully");
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative flex flex-col h-screen sidebar-bg border-r"
        style={{ borderColor: "hsl(var(--sidebar-border))" }}
      >
        {/* ── Logo ── */}
        <div className="flex items-center h-16 px-4 gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5 text-primary-400" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="font-display text-white text-lg font-bold whitespace-nowrap"
              >
                CropShield
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <Separator className="opacity-20" />

        {/* ── User card ── */}
        <div className="px-3 py-4">
          <div
            className={`flex items-center gap-3 rounded-xl p-2 ${collapsed ? "justify-center" : ""}`}
            style={{ background: "hsl(var(--sidebar-hover))" }}
          >
            <Avatar className="w-9 h-9 shrink-0 ring-2 ring-primary-500/30">
              <AvatarFallback className="bg-primary-700 text-primary-100 text-sm font-bold">
                {getInitials(user?.fullName ?? user?.fullName ?? "U")}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-white text-sm font-semibold truncate max-w-[130px]">
                    {user?.fullName ?? user?.fullName ?? "Farmer"}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Sprout className="w-3 h-3 text-primary-400" />
                    <span className="text-primary-400 text-xs">Farmer</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Nav items ── */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarNavItem key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <Separator className="opacity-20" />

        {/* ── Logout ── */}
        <div className="px-3 py-4">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center p-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors group"
            >
              <LogOut className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium whitespace-nowrap">
                Logout
              </span>
            </button>
          )}
        </div>

        {/* ── Collapse toggle ── */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary-600 border-2 border-background flex items-center justify-center shadow-md hover:bg-primary-500 transition-colors z-10"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-white" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-white" />
          )}
        </button>
      </motion.aside>
    </TooltipProvider>
  );
}

// ── Nav item ───────────────────────────────────────────────
function SidebarNavItem({
  item,
  collapsed,
}: {
  item: (typeof navItems)[0];
  collapsed: boolean;
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
              ${collapsed ? "justify-center" : ""}
              ${
                isActive
                  ? "sidebar-active text-white shadow-green-glow/30"
                  : "text-primary-200 hover:text-white"
              }`
            }
            style={({ isActive }) =>
              isActive
                ? { background: "hsl(var(--sidebar-active))" }
                : undefined
            }
          >
            {({ isActive }) => (
              <div className="flex justify-start space-x-1">
                <item.icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110
                    ${isActive ? "text-white" : "text-primary-300"}`}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            )}
          </NavLink>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right">{item.label}</TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
