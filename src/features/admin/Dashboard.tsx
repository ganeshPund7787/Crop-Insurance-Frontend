import { motion } from "framer-motion";
import {
  Users,
  Sprout,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../services/admin.service";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../config/constants";
import { getInitials } from "../../lib/utils";
import Loader from "../../components/common/Loader";
import dayjs from "dayjs";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: farmersRes, isLoading } = useQuery({
    queryKey: ["admin", "farmers"],
    queryFn: adminService.getAllFarmers,
    select: (res) => res.data,
  });

  const farmers = farmersRes ?? [];
  const totalFarmers = farmers.length;
  const recentFarmers = [...farmers]
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime(),
    )
    .slice(0, 5);

  const stats = [
    {
      label: "Total Farmers",
      value: totalFarmers,
      icon: Users,
      color: "text-primary-500",
      bg: "bg-primary-500/10",
      change: "Registered users",
    },
    {
      label: "Active Policies",
      value: Math.floor(totalFarmers * 0.8),
      icon: ShieldCheck,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      change: "80% coverage rate",
    },
    {
      label: "Total Farms",
      value: farmers.reduce((acc, f) => acc + (f.farmsCount ?? 0), 0),
      icon: Sprout,
      color: "text-green-500",
      bg: "bg-green-500/10",
      change: "Across all farmers",
    },
    {
      label: "Growth",
      value: "+12%",
      icon: TrendingUp,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      change: "This month",
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
            Admin Panel 👋
          </p>
          <h2 className="font-display text-2xl font-bold mb-1">
            Welcome, {user?.fullName ?? "Admin"}
          </h2>
          <p className="text-primary-200 text-sm">
            Here's an overview of the CropShield platform.
          </p>
        </div>
        <div className="absolute top-4 right-6 text-5xl opacity-20">🛡️</div>
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
            <Card className="border-border hover:shadow-card transition-shadow">
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

      {/* ── Recent farmers ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="font-display text-lg">
              Recent Registrations
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(ROUTES.ADMIN_FARMERS)}
              className="gap-1.5 text-primary-600 border-primary-500/30 hover:bg-primary-500/5"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentFarmers.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-2">👨‍🌾</div>
                <p className="text-muted-foreground text-sm">
                  No farmers registered yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentFarmers.map((farmer, i) => (
                  <motion.div
                    key={farmer.userId}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.07 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors"
                  >
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarFallback className="bg-primary-700 text-primary-100 text-xs font-bold">
                        {getInitials(farmer.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {farmer.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {farmer.email}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge
                        variant="secondary"
                        className="text-xs bg-primary-500/10 text-primary-600 dark:text-primary-400"
                      >
                        {farmer.state ?? "N/A"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {farmer.createdAt
                          ? dayjs(farmer.createdAt).format("DD MMM YYYY")
                          : "N/A"}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
