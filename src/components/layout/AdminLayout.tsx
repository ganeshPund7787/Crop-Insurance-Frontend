import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";
import { ROUTES } from "../../config/constants";

const PAGE_TITLES: Record<string, string> = {
  [ROUTES.ADMIN_DASHBOARD]: "Admin Dashboard",
  [ROUTES.ADMIN_FARMERS]: "Farmers Management",
  [ROUTES.ADMIN_CHANGE_PASSWORD]: "Change Password",
};

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? "CropShield Admin";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((p) => !p)}
        />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-60 border-0">
          <AdminSidebar
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader
          onMobileMenuOpen={() => setMobileOpen(true)}
          pageTitle={pageTitle}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
