import { Moon, Sun, Bell, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";
import { getInitials } from "../../lib/utils";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/constants";
import { authService } from "../../services/auth.service";
import toast from "react-hot-toast";

interface HeaderProps {
  onMobileMenuOpen: () => void;
  pageTitle?: string;
}

export default function Header({ onMobileMenuOpen, pageTitle }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
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
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-16 header-bg border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0"
    >
      {/* ── Left: mobile menu + page title ── */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMobileMenuOpen}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {pageTitle && (
          <div>
            <h1 className="font-display text-lg font-bold text-foreground leading-none">
              {pageTitle}
            </h1>
          </div>
        )}
      </div>

      {/* ── Right: actions ── */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-xl text-muted-foreground hover:text-foreground"
        >
          <motion.div
            key={theme}
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </motion.div>
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl text-muted-foreground hover:text-foreground relative"
        >
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-primary-500 hover:bg-primary-500">
            2
          </Badge>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-accent transition-colors outline-none">
              <Avatar className="w-8 h-8 ring-2 ring-primary-500/30">
                <AvatarFallback className="bg-primary-700 text-primary-100 text-xs font-bold">
                  {getInitials(user?.fullName ?? user?.email ?? "U")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-foreground leading-none">
                  {user?.fullName ?? user?.email ?? "Farmer"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user?.email}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold">
                {user?.fullName ?? user?.role}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(ROUTES.FARMER_PROFILE)}>
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate(ROUTES.FARMER_CHANGE_PASSWORD)}
            >
              Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-500 focus:text-red-500"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
