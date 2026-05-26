import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ROUTES } from "../../config/constants";

// Page title map
const PAGE_TITLES: Record<string, string> = {
  [ROUTES.FARMER_DASHBOARD]: "Dashboard",
  [ROUTES.FARMER_PROFILE]: "My Profile",
  [ROUTES.FARMER_ADD_FARM]: "Add Farm",
  [ROUTES.FARMER_CHANGE_PASSWORD]: "Change Password",
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] ?? "CropShield";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((p) => !p)}
        />
      </div>

      {/* ── Mobile Sidebar (Sheet) ── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-60 border-0">
          <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* ── Main content ── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          onMobileMenuOpen={() => setMobileOpen(true)}
          pageTitle={pageTitle}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
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
