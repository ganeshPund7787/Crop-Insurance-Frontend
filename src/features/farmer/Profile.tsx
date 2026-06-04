import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Shield,
  Sprout,
  Edit,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useFarmerProfile } from "../../hooks/useAuth";
import { getInitials } from "../../lib/utils";
import Loader from "../../components/common/Loader";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

// ── Animation ──────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

// ── Info row ───────────────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
  masked,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  masked?: boolean;
}) {
  const display =
    masked && value ? value.slice(0, 4) + "••••" + value.slice(-4) : value;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground mt-0.5 truncate">
          {display ?? (
            <span className="text-muted-foreground font-normal italic">
              Not provided
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export default function FarmerProfile() {
  const { data: profile, isLoading, isError } = useFarmerProfile();
  const navigate = useNavigate();
  if (isLoading) return <Loader />;

  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="text-5xl">😕</div>
        <p className="text-muted-foreground font-medium">
          Failed to load profile
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Profile hero card ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-border overflow-hidden">
          {/* Green banner */}
          <div className="h-28 bg-green-gradient relative">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/5" />
            </div>
            <div className="absolute top-3 right-4">
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified Farmer
              </Badge>
            </div>
          </div>

          <CardContent className="px-6 pb-6">
            {/* Avatar overlapping banner */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-4">
              <Avatar className="w-24 h-24 ring-4 ring-background shadow-lg shrink-0">
                <AvatarFallback className="bg-primary-700 text-white text-2xl font-bold font-display">
                  {getInitials(profile.fullName ?? "U")}
                </AvatarFallback>
              </Avatar>

              <div className="pb-1 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      {profile.fullName}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-0.5">
                      {profile.email}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-primary-500/10 text-primary-600 dark:text-primary-400 shrink-0"
                  >
                    <Sprout className="w-3 h-3 mr-1" />
                    {profile.role}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                {
                  label: "Farms",
                  value: profile.farms?.length ?? 0,
                  icon: "🌾",
                },
                {
                  label: "State",
                  value: profile.state ?? "N/A",
                  icon: "📍",
                },
                {
                  label: "Member Since",
                  value: profile.createdAt
                    ? dayjs(profile.createdAt).format("MMM YYYY")
                    : "N/A",
                  icon: "📅",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-3 rounded-xl bg-muted/50 border border-border"
                >
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <p className="font-display text-lg font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Two column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Personal information ── */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="border-border h-full">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <User className="w-4 h-4 text-primary-500" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="divide-y divide-border">
                <InfoRow
                  icon={User}
                  label="Full Name"
                  value={profile.fullName}
                />
                <InfoRow
                  icon={Mail}
                  label="Email Address"
                  value={profile.email}
                />
                <InfoRow
                  icon={Phone}
                  label="Mobile Number"
                  value={profile.phoneNumber}
                />
                <InfoRow
                  icon={CreditCard}
                  label="Aadhaar Number"
                  value={profile.aadhaarNumber}
                  masked
                />
                <InfoRow
                  icon={Calendar}
                  label="Registered On"
                  value={
                    profile.createdAt
                      ? dayjs(profile.createdAt).format("DD MMMM YYYY")
                      : undefined
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Location information ── */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="border-border h-full">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="divide-y divide-border">
                <InfoRow icon={MapPin} label="State" value={profile.state} />
                <InfoRow
                  icon={MapPin}
                  label="District"
                  value={profile.district}
                />
              </div>

              {/* Map placeholder */}
              <div className="mt-4 rounded-xl overflow-hidden border border-border bg-muted/30 h-36 flex flex-col items-center justify-center gap-2">
                <div className="text-3xl">🗺️</div>
                <p className="text-sm text-muted-foreground font-medium">
                  {profile.district
                    ? `${profile.district}, ${profile.state}`
                    : "Location not set"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Farms list ── */}
      <motion.div
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Sprout className="w-4 h-4 text-primary-500" />
              Registered Farms
              <Badge
                variant="secondary"
                className="ml-auto bg-primary-500/10 text-primary-600 dark:text-primary-400"
              >
                {profile.farms?.length ?? 0} farms
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {!profile.farms || profile.farms.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🌱</div>
                <p className="text-muted-foreground text-sm">
                  No farms registered yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.farms.map((farm, i) => (
                  <motion.div
                    key={farm.farmId ?? i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    onClick={() =>
                      navigate(`/dashboard/farms/${farm.farmId}/crops`)
                    }
                    className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary-500/30 hover:bg-accent/40 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                      <Sprout className="w-5 h-5 text-primary-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-foreground">
                          {farm.farmName}
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-primary-500/10 text-primary-600 dark:text-primary-400"
                        >
                          {farm.cropType}
                        </Badge>
                        {farm.season && (
                          <Badge variant="outline" className="text-xs">
                            {farm.season}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {farm.location}
                        </span>
                        {farm.soilType && (
                          <span className="text-xs text-muted-foreground">
                            🪨 {farm.soilType}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">
                        {farm.areaInAcres} ac
                      </p>
                      <p className="text-xs text-primary-500 group-hover:underline mt-0.5">
                        View Crops →
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Account security ── */}
      <motion.div
        custom={3}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary-500" />
              Account Security
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Password
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last changed: recently
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-primary-500/10 text-primary-600 dark:text-primary-400"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Protected
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
