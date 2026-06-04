import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Wheat,
  Calendar,
  IndianRupee,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Sprout,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { farmerService } from "../../services/farmer.service";
import { useFarmerProfile } from "../../hooks/useAuth";
import { formatINR } from "../../lib/utils";
import { DAMAGE_TYPES, ROUTES } from "../../config/constants";
import dayjs from "dayjs";
import toast from "react-hot-toast";

// ── Zod schema ─────────────────────────────────────────────
const newClaimSchema = z.object({
  id: z.string().min(1, "Please select a farm"),

  cropId: z.string().min(1, "Please select a crop"),

  damageType: z.string().min(1, "Please select damage type"),

  damageDescription: z
    .string()
    .min(1, "Description is required")
    .min(20, "Please describe the damage in detail (min 20 characters)")
    .max(1000, "Description is too long"),

  estimatedLossAmount: z
    .string()
    .min(1, "Estimated loss amount is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Must be a positive amount",
    ),

  incidentDate: z
    .string()
    .min(1, "Incident date is required")
    .refine(
      (val) => new Date(val) <= new Date(),
      "Incident date cannot be in the future",
    ),
});

type NewClaimForm = z.infer<typeof newClaimSchema>;

// ── Animation variants ─────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function FarmerNewClaim() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [claimNumber, setClaimNumber] = useState("");

  // Pre-fill from URL params (coming from FarmCrops page)
  const prefilledCropId = searchParams.get("cropId") ?? "";
  const prefilledCropName = searchParams.get("cropName") ?? "";
  const prefilledid = searchParams.get("id") ?? "";

  const { data: profile } = useFarmerProfile();
  const farms = profile?.farms ?? [];

  const form = useForm<NewClaimForm>({
    resolver: zodResolver(newClaimSchema),
    defaultValues: {
      id: prefilledid,
      cropId: prefilledCropId,
      damageType: "",
      damageDescription: "",
      estimatedLossAmount: "",
      incidentDate: "",
    },
  });

  const selectedid = form.watch("id");

  // Load crops for selected farm
  const { data: cropsRes, isLoading: cropsLoading } = useQuery({
    queryKey: ["farmer", "crops", selectedid],
    queryFn: () => farmerService.getCrops(selectedid),
    enabled: !!selectedid,
    select: (r: any) => r.data,
  });

  const crops = cropsRes ?? [];

  // Reset cropId when farm changes
  useEffect(() => {
    if (selectedid && selectedid !== prefilledid) {
      form.setValue("cropId", "");
    }
  }, [selectedid]);

  // ── Submit mutation ────────────────────────────────────
  // const { mutate: submitClaim, isPending } = useMutation({
  //   mutationFn: (values: NewClaimForm) =>
  //     farmerService.submitClaim({
  //       cropId: values.cropId,
  //       damageType: Number(values.damageType),
  //       damageDescription: values.damageDescription,
  //       estimatedLossAmount: Number(values.estimatedLossAmount),
  //       incidentDate: new Date(values.incidentDate).toISOString(),
  //     }),
  //   onSuccess: (res) => {
  //     setClaimNumber(res.data.claimNumber);
  //     setSubmitted(true);
  //     queryClient.invalidateQueries({ queryKey: ["farmer", "claims"] });
  //   },
  //   onError: () => toast.error("Failed to submit claim. Please try again."),
  // });
  const { mutate: submitClaim, isPending } = useMutation({
    mutationFn: (values: NewClaimForm) =>
      farmerService.submitClaim({
        cropId: values.cropId,
        damageType: Number(values.damageType),
        damageDescription: values.damageDescription,
        estimatedLossAmount: Number(values.estimatedLossAmount),
        // ✅ Fix: append T00:00:00 before ISO conversion to treat as local time
        incidentDate: dayjs(values.incidentDate).toISOString(),
      }),
    onSuccess: (res) => {
      setClaimNumber(res.data.claimNumber);
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["farmer", "claims"] });
    },
    onError: () => toast.error("Failed to submit claim. Please try again."),
  });

  // ── Success screen ─────────────────────────────────────
  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-7xl"
          >
            📋
          </motion.div>
          <div className="w-16 h-16 rounded-full bg-primary-500/15 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Claim Submitted!
          </h2>
          {claimNumber && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500/10 border border-primary-500/20">
              <FileText className="w-4 h-4 text-primary-500" />
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                {claimNumber}
              </span>
            </div>
          )}
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your claim has been submitted successfully. An insurance agent will
            review your case shortly.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(ROUTES.FARMER_DASHBOARD)}
            >
              Go to Dashboard
            </Button>
            <Button
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
              onClick={() => navigate(ROUTES.FARMER_CLAIMS)}
            >
              View My Claims
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">
            Submit New Claim
          </h1>
          <p className="text-muted-foreground text-sm">
            Report crop damage and apply for insurance coverage
          </p>
        </div>
      </motion.div>

      {/* ── Pre-filled crop notice ── */}
      {prefilledCropName && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center gap-3 p-4 rounded-xl bg-primary-500/8 border border-primary-500/20"
        >
          <Sprout className="w-5 h-5 text-primary-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Filing claim for: {prefilledCropName}
            </p>
            <p className="text-xs text-muted-foreground">
              Crop pre-selected from your farm
            </p>
          </div>
        </motion.div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit((d) => submitClaim(d))}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            {/* ── Section 1: Farm & Crop ── */}
            <motion.div variants={itemVariants}>
              <Card className="border-border">
                <CardHeader className="pb-2 pt-5 px-6">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-primary-500" />
                    Farm & Crop Details
                  </CardTitle>
                  <Separator className="mt-3" />
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                  {/* Farm selector */}
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Select Farm{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Choose your farm" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {farms.length === 0 ? (
                              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                                No farms registered
                              </div>
                            ) : (
                              farms.map((farm) => (
                                <SelectItem key={farm.id} value={farm.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{farm.farmName}</span>
                                    <span className="text-muted-foreground text-xs">
                                      — {farm.location}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Crop selector */}
                  <FormField
                    control={form.control}
                    name="cropId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Select Crop{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedid || cropsLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              {cropsLoading ? (
                                <span className="flex items-center gap-2 text-muted-foreground">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Loading crops...
                                </span>
                              ) : (
                                <SelectValue
                                  placeholder={
                                    !selectedid
                                      ? "Select a farm first"
                                      : crops.length === 0
                                        ? "No crops for this farm"
                                        : "Choose damaged crop"
                                  }
                                />
                              )}
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {crops
                              .filter((c: any) => c.status === "Active")
                              .map((crop: any) => (
                                <SelectItem key={crop.id} value={crop.id}>
                                  <div className="flex items-center gap-2">
                                    <Wheat className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span>{crop.cropName}</span>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs ml-1"
                                    >
                                      {crop.season}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          Only active crops are shown
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Section 2: Damage Info ── */}
            <motion.div variants={itemVariants}>
              <Card className="border-border">
                <CardHeader className="pb-2 pt-5 px-6">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Damage Information
                  </CardTitle>
                  <Separator className="mt-3" />
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                  {/* Damage type */}
                  <FormField
                    control={form.control}
                    name="damageType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Damage Type{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Object.entries(DAMAGE_TYPES).map(([key, label]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => field.onChange(key)}
                              className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left
                                ${
                                  field.value === key
                                    ? "border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400"
                                    : "border-border text-muted-foreground hover:border-primary-400/50 hover:text-foreground"
                                }`}
                            >
                              {getDamageEmoji(Number(key))} {label}
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Incident date */}
                  <FormField
                    control={form.control}
                    name="incidentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Incident Date{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="date"
                              className="pl-10 h-11"
                              max={dayjs().format("YYYY-MM-DD")}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Damage description */}
                  <FormField
                    control={form.control}
                    name="damageDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Damage Description{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the damage in detail — what happened, when, how much of the crop was affected, any witnesses or evidence..."
                            className="resize-none h-28"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs flex items-center justify-between">
                          <span>Minimum 20 characters</span>
                          <span
                            className={
                              field.value.length < 20
                                ? "text-destructive"
                                : "text-primary-500"
                            }
                          >
                            {field.value.length} chars
                          </span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Section 3: Loss Amount ── */}
            <motion.div variants={itemVariants}>
              <Card className="border-border">
                <CardHeader className="pb-2 pt-5 px-6">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-primary-500" />
                    Estimated Loss
                  </CardTitle>
                  <Separator className="mt-3" />
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <FormField
                    control={form.control}
                    name="estimatedLossAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Estimated Loss Amount (₹){" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="e.g. 75000"
                              className="pl-10 h-11"
                              type="number"
                              min="1"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          {field.value &&
                          !isNaN(Number(field.value)) &&
                          Number(field.value) > 0
                            ? `= ${formatINR(Number(field.value))}`
                            : "Enter your estimated crop loss in Indian Rupees"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Disclaimer ── */}
            <motion.div variants={itemVariants}>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By submitting this claim, you confirm that all information
                  provided is accurate and truthful. False claims may result in
                  rejection and legal action. An insurance agent will inspect
                  your farm to verify the damage.
                </p>
              </div>
            </motion.div>

            {/* ── Submit buttons ── */}
            <motion.div variants={itemVariants} className="flex gap-3 pb-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12"
                disabled={isPending}
                onClick={() => navigate(-1)}
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
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Submit Claim
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

// ── Damage emoji helper ────────────────────────────────────
function getDamageEmoji(type: number): string {
  const map: Record<number, string> = {
    0: "🌊",
    1: "🌵",
    2: "🐛",
    3: "🔥",
    4: "🌨️",
    5: "🌪️",
    6: "❓",
  };
  return map[type] ?? "❓";
}
