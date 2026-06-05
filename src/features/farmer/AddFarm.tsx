import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sprout,
  MapPin,
  Ruler,
  Mountain,
  ArrowLeft,
  CheckCircle,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useAddFarmMutation } from "../../hooks/useAuth";
import { ROUTES } from "../../config/constants";

// ── Static data ────────────────────────────────────────────
const CROP_TYPES = [
  "Rice",
  "Wheat",
  "Sugarcane",
  "Cotton",
  "Soybean",
  "Maize",
  "Jowar",
  "Bajra",
  "Tur (Arhar)",
  "Gram (Chana)",
  "Groundnut",
  "Sunflower",
  "Onion",
  "Tomato",
  "Potato",
  "Banana",
  "Mango",
  "Grapes",
  "Orange",
  "Pomegranate",
  "Other",
];

const SEASONS = [
  { value: "Kharif", label: "Kharif (Jun – Oct)", emoji: "🌧️" },
  { value: "Rabi", label: "Rabi (Nov – Apr)", emoji: "❄️" },
  { value: "Zaid", label: "Zaid (Apr – Jun)", emoji: "☀️" },
  { value: "Annual", label: "Annual (Year-round)", emoji: "📅" },
];

const SOIL_TYPES = [
  "Black Cotton (Regur)",
  "Red Laterite",
  "Alluvial",
  "Sandy Loam",
  "Clay",
  "Loamy",
  "Silt",
  "Saline/Alkaline",
  "Other",
];

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
];

// ── Zod schema ─────────────────────────────────────────────
const addFarmSchema = z.object({
  farmName: z
    .string()
    .min(1, "Farm name is required")
    .min(2, "Farm name must be at least 2 characters")
    .max(100, "Farm name is too long"),

  location: z
    .string()
    .min(1, "Location is required")
    .min(3, "Enter a more specific location"),

  areaInAcres: z
    .string()
    .min(1, "Area is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Area must be a positive number",
    )
    .refine(
      (val) => Number(val) <= 10000,
      "Area seems too large — max 10,000 acres",
    ),

  cropType: z.string().min(1, "Crop type is required"),

  season: z.string().optional(),

  soilType: z.string().optional(),

  state: z.string().optional(),

  district: z.string().optional(),
});

type AddFarmFormValues = z.infer<typeof addFarmSchema>;

// ── Animation variants ─────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ── Section header ─────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-primary-500" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export default function AddFarm() {
  const navigate = useNavigate();
  const { mutate: addFarm, isPending } = useAddFarmMutation();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<AddFarmFormValues>({
    resolver: zodResolver(addFarmSchema),
    defaultValues: {
      farmName: "",
      location: "",
      areaInAcres: "",
      cropType: "",
      season: "",
      soilType: "",
      state: "",
      district: "",
    },
  });

  function onSubmit(values: AddFarmFormValues) {
    const payload = {
      ...values,
      areaInAcres: Number(values.areaInAcres),
    };

    addFarm(payload, {
      onSuccess: () => {
        setSubmitted(true);
        setTimeout(() => {
          navigate(ROUTES.FARMER_DASHBOARD);
        }, 2000);
      },
    });
  }

  // ── Success screen ─────────────────────────────────────
  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-7xl"
          >
            🌾
          </motion.div>
          <div className="w-16 h-16 rounded-full bg-primary-500/15 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Farm Registered!
          </h2>
          <p className="text-muted-foreground text-sm">
            Your farm has been successfully added. Redirecting to dashboard...
          </p>
          <motion.div className="h-1 bg-primary-500/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(ROUTES.FARMER_DASHBOARD)}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">
            Register New Farm
          </h1>
          <p className="text-muted-foreground text-sm">
            Add your farm details to get crop insurance coverage
          </p>
        </div>
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            {/* ── Section 1: Basic Info ── */}
            <motion.div variants={itemVariants}>
              <Card className="border-border">
                <CardHeader className="pb-2 pt-5 px-6">
                  <SectionHeader
                    icon={Sprout}
                    title="Basic Farm Information"
                    description="Enter the primary details about your farm"
                  />
                  <Separator />
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                  {/* Farm name */}
                  <FormField
                    control={form.control}
                    name="farmName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Farm Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Sprout className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="e.g. North Field, Karad Farm"
                              className="pl-10 h-11"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Area + Crop row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="areaInAcres"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">
                            Area (in Acres){" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                placeholder="e.g. 4.5"
                                className="pl-10 h-11"
                                type="number"
                                step="0.1"
                                min="0.1"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">
                            Enter area in acres (1 acre ≈ 0.4 hectare)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cropType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">
                            Crop Type{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select crop" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60">
                              {CROP_TYPES.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Season */}
                  <FormField
                    control={form.control}
                    name="season"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Crop Season
                        </FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {SEASONS.map((s) => (
                            <button
                              key={s.value}
                              type="button"
                              onClick={() => field.onChange(s.value)}
                              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-sm font-medium
                                ${
                                  field.value === s.value
                                    ? "border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400"
                                    : "border-border hover:border-primary-400/50 text-muted-foreground hover:text-foreground"
                                }`}
                            >
                              <span className="text-xl">{s.emoji}</span>
                              <span className="text-xs text-center leading-tight">
                                {s.value}
                              </span>
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Section 2: Location ── */}
            <motion.div variants={itemVariants}>
              <Card className="border-border">
                <CardHeader className="pb-2 pt-5 px-6">
                  <SectionHeader
                    icon={MapPin}
                    title="Farm Location"
                    description="Specify where your farm is located"
                  />
                  <Separator />
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Farm Address / Village{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="e.g. Village Karad, Taluka Karad"
                              className="pl-10 h-11"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* State + District */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">State</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60">
                              {INDIAN_STATES.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">
                            District
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                placeholder="e.g. Satara"
                                className="pl-10 h-11"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Section 3: Soil ── */}
            <motion.div variants={itemVariants}>
              <Card className="border-border">
                <CardHeader className="pb-2 pt-5 px-6">
                  <SectionHeader
                    icon={Mountain}
                    title="Soil Information"
                    description="Optional — helps calculate accurate insurance premium"
                  />
                  <Separator />
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <FormField
                    control={form.control}
                    name="soilType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Soil Type</FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {SOIL_TYPES.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => field.onChange(s)}
                              className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left
                                ${
                                  field.value === s
                                    ? "border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400"
                                    : "border-border hover:border-primary-400/50 text-muted-foreground hover:text-foreground"
                                }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Preview card ── */}
            <motion.div variants={itemVariants}>
              <FarmPreview form={form} />
            </motion.div>

            {/* ── Submit ── */}
            <motion.div variants={itemVariants} className="flex gap-3 pb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTES.FARMER_DASHBOARD)}
                className="flex-1 h-12"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 h-12 bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-green-glow hover:shadow-none transition-all"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                    />
                    Registering Farm...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Register Farm
                  </span>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </Form>
    </div>
  );
}

// ── Live preview component ─────────────────────────────────
function FarmPreview({ form }: { form: any }) {
  const values = form.watch();
  const hasData = values.farmName || values.cropType || values.areaInAcres;

  if (!hasData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-primary-500/30 bg-primary-500/5">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Farm Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center shrink-0">
              <Sprout className="w-5 h-5 text-primary-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">
                {values.farmName || "Farm Name"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {values.location || "Location not set"}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {values.cropType && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-primary-500/10 text-primary-600 dark:text-primary-400"
                  >
                    {values.cropType}
                  </Badge>
                )}
                {values.season && (
                  <Badge variant="outline" className="text-xs">
                    {values.season}
                  </Badge>
                )}
                {values.areaInAcres && (
                  <Badge variant="outline" className="text-xs">
                    {values.areaInAcres} acres
                  </Badge>
                )}
                {values.soilType && (
                  <Badge variant="outline" className="text-xs">
                    {values.soilType}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
