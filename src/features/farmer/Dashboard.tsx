import { motion } from "framer-motion";
import {
  Sprout,
  Shield,
  CloudRain,
  TrendingUp,
  Plus,
  ArrowRight,
  MapPin,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useFarmerProfile, useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../config/constants";
import Loader from "../../components/common/Loader";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading } = useFarmerProfile();

  const stats = [
    {
      label: "Total Farms",
      value: profile?.farms?.length ?? 0,
      icon: Sprout,
      color: "text-primary-500",
      bg: "bg-primary-500/10",
      change: "+1 this month",
    },
    {
      label: "Insured Area",
      value: `${
        profile?.farms
          ?.reduce((acc, f) => acc + (f.areaInAcres ?? 0), 0)
          .toFixed(1) ?? 0
      } ac`,
      icon: Shield,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      change: "Active coverage",
    },
    {
      label: "Weather Alerts",
      value: 2,
      icon: CloudRain,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      change: "Check now",
    },
    {
      label: "Risk Score",
      value: "Low",
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
      change: "Good standing",
    },
  ];

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* ── Welcome banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-green-gradient p-6 text-white relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute right-16 bottom-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2" />
        <div className="relative z-10">
          <p className="text-primary-200 text-sm font-medium mb-1">
            Welcome back 👋
          </p>
          <h2 className="font-display text-2xl font-bold mb-1">
            {user?.fullName ?? user?.email ?? "Farmer"}
          </h2>
          <p className="text-primary-200 text-sm">
            Here's an overview of your farms and coverage status.
          </p>
        </div>
        <div className="absolute top-4 right-6 text-5xl opacity-20">🌾</div>
      </motion.div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="border-border hover:shadow-card transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs font-medium mb-1">
                      {stat.label}
                    </p>
                    <p className="font-display text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.change}
                    </p>
                  </div>
                  <div className={`${stat.bg} p-2.5 rounded-xl`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── My Farms ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="font-display text-lg">My Farms</CardTitle>
            <Button
              size="sm"
              onClick={() => navigate(ROUTES.FARMER_ADD_FARM)}
              className="bg-primary-600 hover:bg-primary-700 text-white gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Farm
            </Button>
          </CardHeader>

          <CardContent>
            {!profile?.farms || profile.farms.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-3">🌱</div>
                <p className="text-muted-foreground font-medium mb-1">
                  No farms registered yet
                </p>
                <p className="text-muted-foreground text-sm mb-4">
                  Add your first farm to get started with crop insurance
                </p>
                <Button
                  onClick={() => navigate(ROUTES.FARMER_ADD_FARM)}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Register Your First Farm
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.farms.map((farm, i) => (
                  <motion.div
                    key={farm.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.07 }}
                    onClick={() =>
                      navigate(
                        `/dashboard/farms/${farm.farmId ?? farm.id}/crops`,
                      )
                    }
                    className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary-500/30 hover:bg-accent/50 transition-all group cursor-pointer"
                  >
                    {/* Left */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                        <Sprout className="w-5 h-5 text-primary-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">
                          {farm.farmName}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {farm.location}
                          </span>
                          {farm.season && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {farm.season}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-foreground">
                          {farm.areaInAcres} ac
                        </p>
                        {farm.cropType && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-primary-500/10 text-primary-600 dark:text-primary-400"
                          >
                            {farm.cropType}
                          </Badge>
                        )}
                      </div>
                      <div className="hidden sm:block text-right">
                        <p className="text-xs text-primary-500 font-medium">
                          View Crops
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Quick actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Add New Farm",
                  icon: "🌾",
                  to: ROUTES.FARMER_ADD_FARM,
                },
                {
                  label: "My Claims",
                  icon: "📋",
                  to: ROUTES.FARMER_CLAIMS,
                },
                {
                  label: "View Profile",
                  icon: "👤",
                  to: ROUTES.FARMER_PROFILE,
                },
                {
                  label: "Change Password",
                  icon: "🔑",
                  to: ROUTES.FARMER_CHANGE_PASSWORD,
                },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.to)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary-500/40 hover:bg-primary-500/5 transition-all group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {action.icon}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground text-center">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
