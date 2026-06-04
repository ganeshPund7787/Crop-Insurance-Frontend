// import { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import {
//   ArrowLeft,
//   Plus,
//   Sprout,
//   Calendar,
//   Wheat,
//   TrendingUp,
//   CheckCircle,
//   Loader2,
//   RefreshCw,
// } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Separator } from "@/components/ui/separator";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { farmerService } from "../../services/farmer.service";
// import { useFarmerProfile } from "../../hooks/useAuth";
// import Loader from "../../components/common/Loader";
// import dayjs from "dayjs";
// import toast from "react-hot-toast";
// import type { CropType } from "@/types/farmer.types";

// // ── Static data ────────────────────────────────────────────
// const CROP_TYPES = [
//   "Rice",
//   "Wheat",
//   "Sugarcane",
//   "Cotton",
//   "Soybean",
//   "Maize",
//   "Jowar",
//   "Bajra",
//   "Bajara",
//   "Tur (Arhar)",
//   "Gram (Chana)",
//   "Groundnut",
//   "Sunflower",
//   "Onion",
//   "Tomato",
//   "Potato",
//   "Banana",
//   "Mango",
//   "Grapes",
//   "Orange",
//   "Pomegranate",
//   "Other",
// ];

// const SEASONS = [
//   { value: "Kharif", label: "Kharif (Jun – Oct)", emoji: "🌧️" },
//   { value: "Rabi", label: "Rabi (Nov – Apr)", emoji: "❄️" },
//   { value: "Zaid", label: "Zaid (Apr – Jun)", emoji: "☀️" },
//   { value: "Annual", label: "Annual (Year-round)", emoji: "📅" },
// ];

// // ── Zod schema ─────────────────────────────────────────────
// const addCropSchema = z
//   .object({
//     cropName: z.string().min(1, "Crop name is required"),

//     season: z.string().min(1, "Season is required"),

//     expectedYieldTons: z
//       .string()
//       .min(1, "Expected yield is required")
//       .refine(
//         (val) => !isNaN(Number(val)) && Number(val) > 0,
//         "Must be a positive number",
//       ),

//     sowingDate: z.string().min(1, "Sowing date is required"),

//     expectedHarvestDate: z.string().min(1, "Expected harvest date is required"),
//   })
//   .refine(
//     (data) => new Date(data.expectedHarvestDate) > new Date(data.sowingDate),
//     {
//       message: "Harvest date must be after sowing date",
//       path: ["expectedHarvestDate"],
//     },
//   );

// type AddCropForm = z.infer<typeof addCropSchema>;

// // ── Crop status badge ──────────────────────────────────────
// function CropStatusBadge({ status }: { status: string }) {
//   const config: Record<string, { className: string }> = {
//     active: {
//       className: "bg-primary-500/10 text-primary-600 dark:text-primary-400",
//     },
//     harvested: { className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
//     damaged: { className: "bg-red-500/10 text-red-600 dark:text-red-400" },
//     inactive: { className: "bg-muted text-muted-foreground" },
//   };
//   const key = status?.toLowerCase();
//   const c = config[key] ?? config.inactive;

//   return (
//     <Badge variant="secondary" className={`text-xs font-medium ${c.className}`}>
//       {status}
//     </Badge>
//   );
// }

// // ── Crop card ──────────────────────────────────────────────
// function CropCard({
//   crop,
//   index,
//   onSubmitClaim,
// }: {
//   // crop: ReturnType<typeof farmerService.getCrops> extends Promise<infer T>
//   //   ? T extends { data: (infer U)[] }
//   //     ? U
//   //     : never
//   //   : never;
//   crop: CropType;
//   index: number;
//   onSubmitClaim: (cropId: string, cropName: string) => void;
// }) {
//   const daysToHarvest = dayjs(crop.expectedHarvestDate).diff(dayjs(), "day");
//   const isHarvestSoon = daysToHarvest >= 0 && daysToHarvest <= 30;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.07 }}
//     >
//       <Card
//         className={`border-border hover:shadow-card transition-all
//         ${isHarvestSoon ? "border-primary-500/30" : ""}
//       `}
//       >
//         <CardContent className="p-4">
//           {/* Header row */}
//           <div className="flex items-start justify-between gap-2 mb-3">
//             <div className="flex items-center gap-3 min-w-0">
//               <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
//                 <Sprout className="w-5 h-5 text-primary-500" />
//               </div>
//               <div className="min-w-0">
//                 <p className="font-semibold text-foreground text-sm truncate">
//                   {crop.cropName}
//                 </p>
//                 <p className="text-xs text-muted-foreground mt-0.5">
//                   {crop.season} Season
//                 </p>
//               </div>
//             </div>
//             <CropStatusBadge status={crop.status} />
//           </div>

//           <Separator className="mb-3" />

//           {/* Details grid */}
//           <div className="grid grid-cols-2 gap-2 mb-3">
//             <div className="flex items-center gap-2">
//               <TrendingUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
//               <div>
//                 <p className="text-xs text-muted-foreground">Expected Yield</p>
//                 <p className="text-xs font-semibold text-foreground">
//                   {crop.expectedYieldTons} tons
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
//               <div>
//                 <p className="text-xs text-muted-foreground">Sowing Date</p>
//                 <p className="text-xs font-semibold text-foreground">
//                   {dayjs(crop.sowingDate).format("DD MMM YYYY")}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-2 col-span-2">
//               <CheckCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
//               <div>
//                 <p className="text-xs text-muted-foreground">
//                   Expected Harvest
//                 </p>
//                 <p className="text-xs font-semibold text-foreground">
//                   {dayjs(crop.expectedHarvestDate).format("DD MMM YYYY")}
//                   {isHarvestSoon && daysToHarvest >= 0 && (
//                     <span className="ml-2 text-primary-600 dark:text-primary-400">
//                       (
//                       {daysToHarvest === 0
//                         ? "Today!"
//                         : `${daysToHarvest}d left`}
//                       )
//                     </span>
//                   )}
//                   {daysToHarvest < 0 && (
//                     <span className="ml-2 text-muted-foreground">(Past)</span>
//                   )}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Harvest soon banner */}
//           {isHarvestSoon && (
//             <div className="mb-3 px-3 py-2 rounded-lg bg-primary-500/10 border border-primary-500/20">
//               <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
//                 🌾 Harvest approaching in {daysToHarvest} day
//                 {daysToHarvest !== 1 ? "s" : ""}
//               </p>
//             </div>
//           )}

//           {/* Submit claim button */}
//           {crop.status === "Active" && (
//             <Button
//               size="sm"
//               variant="outline"
//               className="w-full h-8 text-xs gap-1.5 border-red-500/30 text-red-600 hover:bg-red-500/5"
//               onClick={() => onSubmitClaim(crop.id, crop.cropName)}
//             >
//               🚨 Report Damage / Submit Claim
//             </Button>
//           )}
//         </CardContent>
//       </Card>
//     </motion.div>
//   );
// }

// // ── Main component ─────────────────────────────────────────
// export default function FarmCrops() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const [dialogOpen, setDialogOpen] = useState(false);

//   // Get farm name from profile
//   const { data: profile } = useFarmerProfile();
//   const farm = profile?.farms?.find((f) => f.id === id);

//   const {
//     data: cropsRes,
//     isLoading,
//     isRefetching,
//     refetch,
//   } = useQuery({
//     queryKey: ["farmer", "crops", id],
//     queryFn: () => farmerService.getCrops(id!),
//     enabled: !!id,
//     select: (r) => r.data,
//   });

//   const crops = cropsRes ?? [];

//   // ── Add crop mutation ──────────────────────────────────
//   const { mutate: addCrop, isPending } = useMutation({
//     mutationFn: (payload: AddCropForm) =>
//       farmerService.addCrop(id!, {
//         cropName: payload.cropName,
//         season: payload.season,
//         expectedYieldTons: Number(payload.expectedYieldTons),
//         sowingDate: new Date(payload.sowingDate).toISOString(),
//         expectedHarvestDate: new Date(
//           payload.expectedHarvestDate,
//         ).toISOString(),
//       }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["farmer", "crops", id],
//       });
//       toast.success("Crop added successfully! 🌱");
//       setDialogOpen(false);
//       form.reset();
//     },
//     onError: () => toast.error("Failed to add crop"),
//   });

//   const form = useForm<AddCropForm>({
//     resolver: zodResolver(addCropSchema),
//     defaultValues: {
//       cropName: "",
//       season: "",
//       expectedYieldTons: "",
//       sowingDate: "",
//       expectedHarvestDate: "",
//     },
//   });

//   function handleSubmitClaimRedirect(cropId: string, cropName: string) {
//     navigate(
//       `/dashboard/claims/new?cropId=${cropId}&cropName=${encodeURIComponent(cropName)}&id=${id}`,
//     );
//   }

//   if (isLoading) return <Loader />;

//   return (
//     <div className="max-w-4xl mx-auto space-y-5">
//       {/* ── Header ── */}
//       <motion.div
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex items-center gap-3"
//       >
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={() => navigate(-1)}
//           className="rounded-xl"
//         >
//           <ArrowLeft className="w-4 h-4" />
//         </Button>
//         <div className="flex-1 min-w-0">
//           <h1 className="font-display text-xl font-bold text-foreground">
//             {farm?.farmName ?? "Farm"} — Crops
//           </h1>
//           <p className="text-muted-foreground text-sm mt-0.5">
//             {farm?.location ?? ""}
//             {crops.length > 0 &&
//               ` · ${crops.length} crop${crops.length !== 1 ? "s" : ""}`}
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => refetch()}
//             disabled={isRefetching}
//             className="gap-2"
//           >
//             <RefreshCw
//               className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
//             />
//             <span className="hidden sm:inline">Refresh</span>
//           </Button>
//           <Button
//             size="sm"
//             className="bg-primary-600 hover:bg-primary-700 text-white gap-2"
//             onClick={() => setDialogOpen(true)}
//           >
//             <Plus className="w-4 h-4" />
//             Add Crop
//           </Button>
//         </div>
//       </motion.div>

//       {/* ── Farm info banner ── */}
//       {farm && (
//         <motion.div
//           initial={{ opacity: 0, y: 8 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.05 }}
//           className="rounded-2xl bg-green-gradient p-5 text-white relative overflow-hidden"
//         >
//           <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
//           <div className="relative z-10 flex items-center justify-between flex-wrap gap-3">
//             <div>
//               <p className="text-primary-200 text-xs font-medium mb-1">
//                 Farm Details
//               </p>
//               <h2 className="font-display text-lg font-bold">
//                 {farm.farmName}
//               </h2>
//               <p className="text-primary-200 text-sm mt-0.5">{farm.location}</p>
//             </div>
//             <div className="flex gap-4">
//               <div className="text-center">
//                 <p className="text-white text-xl font-bold font-display">
//                   {farm.areaInAcres}
//                 </p>
//                 <p className="text-primary-300 text-xs">Acres</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-white text-xl font-bold font-display">
//                   {crops.length}
//                 </p>
//                 <p className="text-primary-300 text-xs">Crops</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-white text-xl font-bold font-display">
//                   {crops.filter((c: any) => c.status === "Active").length}
//                 </p>
//                 <p className="text-primary-300 text-xs">Active</p>
//               </div>
//             </div>
//           </div>
//           <div className="absolute top-3 right-6 text-4xl opacity-20">🌾</div>
//         </motion.div>
//       )}

//       {/* ── Crops grid ── */}
//       {crops.length === 0 ? (
//         <motion.div
//           initial={{ opacity: 0, y: 12 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//         >
//           <Card className="border-border">
//             <CardContent className="py-16 text-center">
//               <div className="text-5xl mb-3">🌱</div>
//               <p className="text-foreground font-semibold mb-1">
//                 No crops registered yet
//               </p>
//               <p className="text-muted-foreground text-sm mb-5">
//                 Add your first crop to this farm to track growth and apply for
//                 insurance
//               </p>
//               <Button
//                 className="bg-primary-600 hover:bg-primary-700 text-white gap-2"
//                 onClick={() => setDialogOpen(true)}
//               >
//                 <Plus className="w-4 h-4" />
//                 Add First Crop
//               </Button>
//             </CardContent>
//           </Card>
//         </motion.div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {crops.map((crop: CropType, i: number) => (
//             <CropCard
//               key={crop.id}
//               crop={crop}
//               index={i}
//               onSubmitClaim={handleSubmitClaimRedirect}
//             />
//           ))}
//         </div>
//       )}

//       {/* ══════════════════════════════════════
//           ADD CROP DIALOG
//       ══════════════════════════════════════ */}
//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="font-display">Add New Crop</DialogTitle>
//             <DialogDescription>
//               Register a crop for {farm?.farmName ?? "this farm"}
//             </DialogDescription>
//           </DialogHeader>

//           <Form {...form}>
//             <form
//               onSubmit={form.handleSubmit((d) => addCrop(d))}
//               className="space-y-4"
//             >
//               {/* Crop name */}
//               <FormField
//                 control={form.control}
//                 name="cropName"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="font-medium">
//                       Crop Name <span className="text-destructive">*</span>
//                     </FormLabel>
//                     <Select
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       <FormControl>
//                         <SelectTrigger className="h-11">
//                           <SelectValue placeholder="Select crop" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent className="max-h-60">
//                         {CROP_TYPES.map((c) => (
//                           <SelectItem key={c} value={c}>
//                             {c}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Season */}
//               <FormField
//                 control={form.control}
//                 name="season"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="font-medium">
//                       Season <span className="text-destructive">*</span>
//                     </FormLabel>
//                     <div className="grid grid-cols-2 gap-2">
//                       {SEASONS.map((s) => (
//                         <button
//                           key={s.value}
//                           type="button"
//                           onClick={() => field.onChange(s.value)}
//                           className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left
//                             ${
//                               field.value === s.value
//                                 ? "border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400"
//                                 : "border-border text-muted-foreground hover:border-primary-400/50"
//                             }`}
//                         >
//                           <span>{s.emoji}</span>
//                           <span className="text-xs leading-tight">
//                             {s.value}
//                           </span>
//                         </button>
//                       ))}
//                     </div>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Expected yield */}
//               <FormField
//                 control={form.control}
//                 name="expectedYieldTons"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="font-medium">
//                       Expected Yield (tons){" "}
//                       <span className="text-destructive">*</span>
//                     </FormLabel>
//                     <FormControl>
//                       <div className="relative">
//                         <Wheat className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//                         <Input
//                           placeholder="e.g. 3.5"
//                           className="pl-10 h-11"
//                           type="number"
//                           step="0.1"
//                           min="0.1"
//                           {...field}
//                         />
//                       </div>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Date row */}
//               <div className="grid grid-cols-2 gap-3">
//                 <FormField
//                   control={form.control}
//                   name="sowingDate"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="font-medium">
//                         Sowing Date <span className="text-destructive">*</span>
//                       </FormLabel>
//                       <FormControl>
//                         <Input type="date" className="h-11" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="expectedHarvestDate"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="font-medium">
//                         Harvest Date <span className="text-destructive">*</span>
//                       </FormLabel>
//                       <FormControl>
//                         <Input type="date" className="h-11" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               {/* Actions */}
//               <div className="flex gap-3 pt-2">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="flex-1"
//                   onClick={() => {
//                     setDialogOpen(false);
//                     form.reset();
//                   }}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   type="submit"
//                   disabled={isPending}
//                   className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
//                 >
//                   {isPending ? (
//                     <span className="flex items-center gap-2">
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                       Adding...
//                     </span>
//                   ) : (
//                     <span className="flex items-center gap-2">
//                       <Plus className="w-4 h-4" />
//                       Add Crop
//                     </span>
//                   )}
//                 </Button>
//               </div>
//             </form>
//           </Form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Plus,
  Sprout,
  Calendar,
  Wheat,
  TrendingUp,
  CheckCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { farmerService } from "../../services/farmer.service";
import { useFarmerProfile } from "../../hooks/useAuth";
import type { CropType } from "../../types/farmer.types";
import Loader from "../../components/common/Loader";
import dayjs from "dayjs";
import toast from "react-hot-toast";

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
  "Bajara",
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
  { value: "Kharif", label: "Kharif", emoji: "🌧️" },
  { value: "Rabi", label: "Rabi", emoji: "❄️" },
  { value: "Zaid", label: "Zaid", emoji: "☀️" },
  { value: "Annual", label: "Annual", emoji: "📅" },
];

// ── Zod schema ─────────────────────────────────────────────
const addCropSchema = z
  .object({
    cropName: z.string().min(1, "Crop name is required"),

    season: z.string().min(1, "Season is required"),

    expectedYieldTons: z
      .string()
      .min(1, "Expected yield is required")
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0,
        "Must be a positive number",
      ),

    sowingDate: z.string().min(1, "Sowing date is required"),

    expectedHarvestDate: z.string().min(1, "Harvest date is required"),
  })
  .refine(
    (data) => new Date(data.expectedHarvestDate) > new Date(data.sowingDate),
    {
      message: "Harvest date must be after sowing date",
      path: ["expectedHarvestDate"],
    },
  );

type AddCropForm = z.infer<typeof addCropSchema>;

// ── Status badge ───────────────────────────────────────────
function CropStatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    active: "bg-primary-500/10 text-primary-600 dark:text-primary-400",
    harvested: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    damaged: "bg-red-500/10 text-red-600 dark:text-red-400",
    inactive: "bg-muted text-muted-foreground",
  };
  const key = status?.toLowerCase();
  return (
    <Badge
      variant="secondary"
      className={`text-xs font-medium ${config[key] ?? config.inactive}`}
    >
      {status}
    </Badge>
  );
}

// ── Crop card ──────────────────────────────────────────────
function CropCard({
  crop,
  index,
  onSubmitClaim,
}: {
  crop: CropType;
  index: number;
  onSubmitClaim: (cropId: string, cropName: string) => void;
}) {
  const daysToHarvest = dayjs(crop.expectedHarvestDate).diff(dayjs(), "day");
  const isHarvestSoon = daysToHarvest >= 0 && daysToHarvest <= 30;
  const isHarvestPast = daysToHarvest < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <Card
        className={`border-border hover:shadow-card transition-all
        ${isHarvestSoon ? "border-primary-500/30" : ""}
      `}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                <Sprout className="w-5 h-5 text-primary-500" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">
                  {crop.cropName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {crop.season} Season
                </p>
              </div>
            </div>
            <CropStatusBadge status={crop.status} />
          </div>

          <Separator className="mb-3" />

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Expected Yield</p>
                <p className="text-xs font-semibold text-foreground">
                  {crop.expectedYieldTons} tons
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Sowing Date</p>
                <p className="text-xs font-semibold text-foreground">
                  {dayjs(crop.sowingDate).format("DD MMM YYYY")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 col-span-2">
              <CheckCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Expected Harvest
                </p>
                <p className="text-xs font-semibold text-foreground">
                  {dayjs(crop.expectedHarvestDate).format("DD MMM YYYY")}
                  {isHarvestSoon && (
                    <span className="ml-2 text-primary-600 dark:text-primary-400">
                      (
                      {daysToHarvest === 0
                        ? "Today!"
                        : `${daysToHarvest}d left`}
                      )
                    </span>
                  )}
                  {isHarvestPast && (
                    <span className="ml-2 text-muted-foreground">(Past)</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Harvest soon alert */}
          {isHarvestSoon && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-primary-500/10 border border-primary-500/20">
              <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                🌾 Harvest in {daysToHarvest} day
                {daysToHarvest !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Report damage */}
          {crop.status === "Active" && (
            <Button
              size="sm"
              variant="outline"
              className="w-full h-8 text-xs gap-1.5 border-red-500/30 text-red-600 hover:bg-red-500/5 dark:text-red-400"
              onClick={() => onSubmitClaim(crop.id, crop.cropName)}
            >
              🚨 Report Damage / Submit Claim
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────
export default function FarmCrops() {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: profile } = useFarmerProfile();
  const farm = profile?.farms?.find(
    (f) => f.id === farmId || f.farmId === farmId,
  );
  const {
    data: crops,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["farmer", "crops", farmId],
    queryFn: () => farmerService.getCrops(farmId!),
    enabled: !!farmId,
    select: (r: any) => r.data,
  });

  const allCrops = crops ?? [];

  // ── Add crop mutation ──────────────────────────────────
  // ✅ Fix 1: onSuccess restored — this was the entire root cause
  const { mutate: addCrop, isPending } = useMutation({
    mutationFn: (payload: AddCropForm) =>
      farmerService.addCrop(farmId!, {
        cropName: payload.cropName,
        season: payload.season,
        expectedYieldTons: Number(payload.expectedYieldTons),
        sowingDate: dayjs(payload.sowingDate).format("YYYY-MM-DDTHH:mm:ss"),
        expectedHarvestDate: dayjs(payload.expectedHarvestDate).format(
          "YYYY-MM-DDTHH:mm:ss",
        ),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer", "crops", farmId] });
      toast.success("Crop added successfully! 🌱");
      setDialogOpen(false);
      form.reset();
    },
    onError: () => toast.error("Failed to add crop. Please try again."),
  });

  const form = useForm<AddCropForm>({
    resolver: zodResolver(addCropSchema),
    defaultValues: {
      cropName: "",
      season: "",
      expectedYieldTons: "",
      sowingDate: "",
      expectedHarvestDate: "",
    },
  });

  function handleReportDamage(cropId: string, cropName: string) {
    navigate(
      `/dashboard/claims/new?cropId=${cropId}&cropName=${encodeURIComponent(cropName)}&farmId=${farmId}`,
    );
  }

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl font-bold text-foreground">
            {farm?.farmName ?? "Farm"} — Crops
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {farm?.location ?? ""}
            {allCrops.length > 0 &&
              ` · ${allCrops.length} crop${allCrops.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            size="sm"
            className="bg-primary-600 hover:bg-primary-700 text-white gap-2"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Crop
          </Button>
        </div>
      </motion.div>

      {/* ── Farm info banner ── */}
      {farm && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl bg-green-gradient p-5 text-white relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-primary-200 text-xs font-medium mb-1">
                Farm Details
              </p>
              <h2 className="font-display text-lg font-bold">
                {farm.farmName}
              </h2>
              <p className="text-primary-200 text-sm mt-0.5">{farm.location}</p>
            </div>
            <div className="flex gap-5">
              <div className="text-center">
                <p className="text-white text-xl font-bold font-display">
                  {farm.areaInAcres}
                </p>
                <p className="text-primary-300 text-xs">Acres</p>
              </div>
              <div className="text-center">
                <p className="text-white text-xl font-bold font-display">
                  {allCrops.length}
                </p>
                <p className="text-primary-300 text-xs">Crops</p>
              </div>
              <div className="text-center">
                <p className="text-white text-xl font-bold font-display">
                  {
                    allCrops.filter((c: CropType) => c.status === "Active")
                      .length
                  }
                </p>
                <p className="text-primary-300 text-xs">Active</p>
              </div>
            </div>
          </div>
          <div className="absolute top-3 right-6 text-4xl opacity-20">🌾</div>
        </motion.div>
      )}

      {/* ── Crops grid or empty state ── */}
      {allCrops.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border">
            <CardTitle>Add Crop: </CardTitle>
            <CardContent className="py-16 text-center">
              <div className="text-5xl mb-3">🌱</div>
              <p className="text-foreground font-semibold mb-1">No crops yet</p>
              <p className="text-muted-foreground text-sm mb-5">
                Add crops to this farm to track growth and apply for insurance
              </p>
              <Button
                className="bg-primary-600 hover:bg-primary-700 text-white gap-2"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Add First Crop
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allCrops.map((crop: CropType, i: number) => (
            <CropCard
              key={crop.id}
              crop={crop}
              index={i}
              onSubmitClaim={handleReportDamage}
            />
          ))}
        </div>
      )}

      {/* ══════════════════════════════
          ADD CROP DIALOG
      ══════════════════════════════ */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) form.reset();
          setDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Crop</DialogTitle>
            <DialogDescription>
              Register a crop for {farm?.farmName ?? "this farm"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => addCrop(d))}
              className="space-y-4 pt-1"
            >
              {/* Crop name */}
              <FormField
                control={form.control}
                name="cropName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Crop Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select crop type" />
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

              {/* Season */}
              <FormField
                control={form.control}
                name="season"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Season <span className="text-destructive">*</span>
                    </FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {SEASONS.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => field.onChange(s.value)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all
                            ${
                              field.value === s.value
                                ? "border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400"
                                : "border-border text-muted-foreground hover:border-primary-400/50"
                            }`}
                        >
                          <span>{s.emoji}</span>
                          <span className="text-xs">{s.label}</span>
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expected yield */}
              <FormField
                control={form.control}
                name="expectedYieldTons"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Expected Yield (tons){" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Wheat className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="e.g. 3.5"
                          className="pl-10 h-11"
                          type="number"
                          step="0.1"
                          min="0.1"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sowing date + Harvest date */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="sowingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        Sowing Date <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expectedHarvestDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        Harvest Date <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={isPending}
                  onClick={() => {
                    setDialogOpen(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Crop
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
