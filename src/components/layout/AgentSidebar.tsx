import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Users,
  UserCircle,
  KeyRound,
  LogOut,
  Leaf,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../../hooks/useAuth";
import { useLogout } from "../../hooks/useLogout";
import { ROUTES } from "../../config/constants";
import { getInitials } from "../../lib/utils";

const navItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: ROUTES.AGENT_DASHBOARD,
    end: true,
  },
  {
    label: "Claims",
    icon: FileText,
    to: ROUTES.AGENT_CLAIMS,
    end: false,
  },
  {
    label: "Inspections",
    icon: ClipboardCheck,
    to: ROUTES.AGENT_INSPECTIONS,
    end: false,
  },
  {
    label: "Farmers",
    icon: Users,
    to: ROUTES.AGENT_FARMERS,
    end: false,
  },
  {
    label: "My Profile",
    icon: UserCircle,
    to: ROUTES.AGENT_PROFILE,
    end: false,
  },
  {
    label: "Change Password",
    icon: KeyRound,
    to: ROUTES.AGENT_CHANGE_PASSWORD,
    end: false,
  },
];

interface AgentSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AgentSidebar({
  collapsed,
  onToggle,
}: AgentSidebarProps) {
  const { user } = useAuth();
  const { handleLogout, isLoggingOut } = useLogout();

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
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="font-display text-white text-base font-bold whitespace-nowrap">
                  CropShield
                </p>
                <p className="text-primary-400 text-xs">Agent Portal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator className="opacity-20" />

        {/* ── Agent card ── */}
        <div className="px-3 py-4">
          <div
            className={`flex items-center gap-3 rounded-xl p-2 ${
              collapsed ? "justify-center" : ""
            }`}
            style={{ background: "hsl(var(--sidebar-hover))" }}
          >
            <Avatar className="w-9 h-9 shrink-0 ring-2 ring-primary-500/30">
              <AvatarFallback className="bg-primary-700 text-primary-100 text-sm font-bold">
                {getInitials(user?.fullName ?? "A")}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden flex-1 min-w-0"
                >
                  <p className="text-white text-sm font-semibold truncate">
                    {user?.fullName ?? "Agent"}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3 text-primary-400 shrink-0" />
                    <span className="text-primary-400 text-xs truncate">
                      Insurance Agent
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <TooltipProvider key={item.to} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl
                      transition-all duration-200 group
                      ${collapsed ? "justify-center" : ""}
                      ${
                        isActive
                          ? "text-white"
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
                      <div className="flex justify-start space-x-2">
                        <item.icon
                          className={`w-5 h-5 shrink-0 transition-transform
                            group-hover:scale-110
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
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center p-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-red-400/30 border-t-red-400 rounded-full inline-block"
                    />
                  ) : (
                    <LogOut className="w-5 h-5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors group disabled:opacity-50"
            >
              {isLoggingOut ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-5 h-5 border-2 border-red-400/30 border-t-red-400 rounded-full inline-block shrink-0"
                />
              ) : (
                <LogOut className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-sm font-medium whitespace-nowrap">
                {isLoggingOut ? "Logging out..." : "Logout"}
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
