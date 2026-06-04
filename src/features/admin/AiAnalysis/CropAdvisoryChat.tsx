import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout,
  Loader2,
  Send,
  XCircle,
  Lightbulb,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { aiAnalysisService } from "../../../services/aiAnalysis.service";
import type { CropAdvisoryResponse } from "../../../types/aiAnalysis.types";

// ── Zod schema ─────────────────────────────────────────────────────────────
const schema = z.object({
  question: z.string().min(10, "Please enter at least 10 characters"),
  cropName: z.string().optional(),
  season: z.string().optional(),
  district: z.string().optional(),
  soilType: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Suggested questions ────────────────────────────────────────────────────
const suggestedQuestions = [
  "What diseases commonly affect wheat during Rabi season?",
  "What is the ideal soil type for cotton cultivation in Maharashtra?",
  "How does flood damage affect rice crop yield estimates?",
  "What are the signs of pest damage in sugarcane fields?",
  "How should hailstorm damage be assessed for insurance claims?",
];

// ── Component ──────────────────────────────────────────────────────────────
export default function CropAdvisoryChat() {
  const [result, setResult] = useState<CropAdvisoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [askedQuestion, setAskedQuestion] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      question: "",
      cropName: "",
      season: "",
      district: "",
      soilType: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAskedQuestion(values.question);

    try {
      const res = await aiAnalysisService.getCropAdvisory({
        question: values.question,
        cropName: values.cropName || undefined,
        season: values.season || undefined,
        district: values.district || undefined,
        soilType: values.soilType || undefined,
      });
      setResult(res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Failed to get advisory. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (q: string) => {
    form.setValue("question", q);
    form.setFocus("question");
  };

  return (
    <div className="space-y-6">
      {/* ── Section title ── */}
      <div className="flex items-center gap-3">
        <div className="bg-green-500/10 p-2.5 rounded-xl">
          <Sprout className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Crop Advisory Chat
          </h3>
          <p className="text-sm text-muted-foreground">
            Ask any crop, disease, weather, or insurance question — powered by
            Gemini AI
          </p>
        </div>
      </div>

      <Separator />

      {/* ── Suggested questions ── */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Suggested Questions
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              type="button"
              onClick={() => handleSuggestedQuestion(q)}
              className="text-xs px-3 py-1.5 rounded-full border border-border
                bg-accent/50 hover:bg-primary-500/10 hover:border-primary-500/40
                hover:text-primary-600 dark:hover:text-primary-400
                text-muted-foreground transition-all duration-150"
            >
              {q}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Form ── */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Question textarea */}
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Question</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="e.g. What are the main causes of crop loss in cotton during Kharif season in black cotton soil areas?"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Optional context toggle */}
          <button
            type="button"
            onClick={() => setShowContext(!showContext)}
            className="flex items-center gap-1.5 text-xs text-primary-500
              hover:text-primary-600 font-medium transition-colors"
          >
            {showContext ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            {showContext ? "Hide" : "Add"} optional context (crop, season,
            district, soil)
          </button>

          {/* Optional context fields */}
          <AnimatePresence>
            {showContext && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2
                  p-4 rounded-xl bg-accent/30 border border-border"
                >
                  <p className="col-span-full text-xs text-muted-foreground">
                    Providing context helps Gemini give more specific answers.
                  </p>

                  <FormField
                    control={form.control}
                    name="cropName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Crop Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Rice, Wheat" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="season"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Season</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select season" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Kharif">Kharif</SelectItem>
                            <SelectItem value="Rabi">Rabi</SelectItem>
                            <SelectItem value="Zaid">Zaid</SelectItem>
                            <SelectItem value="Annual">Annual</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          District / Region
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Aurangabad, Pune"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="soilType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Soil Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select soil type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Black Cotton">
                              Black Cotton
                            </SelectItem>
                            <SelectItem value="Alluvial">Alluvial</SelectItem>
                            <SelectItem value="Red Laterite">
                              Red Laterite
                            </SelectItem>
                            <SelectItem value="Sandy Loam">
                              Sandy Loam
                            </SelectItem>
                            <SelectItem value="Clay">Clay</SelectItem>
                            <SelectItem value="Loamy">Loamy</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto gap-2 bg-primary-600 hover:bg-primary-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Getting Advisory...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Ask Gemini
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl
              bg-red-500/10 border border-red-500/20
              text-red-600 dark:text-red-400"
          >
            <XCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Result Panel ── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Separator />

            {/* Asked question bubble */}
            <div className="flex justify-end">
              <div
                className="max-w-[80%] bg-primary-500/10 border border-primary-500/20
                rounded-2xl rounded-tr-sm px-4 py-3"
              >
                <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">
                  {askedQuestion}
                </p>
              </div>
            </div>

            {/* AI Answer bubble */}
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center
                justify-center shrink-0 mt-0.5"
              >
                <Sprout className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex-1 space-y-4">
                {/* Main answer */}
                <div
                  className="bg-accent/40 border border-border rounded-2xl
                  rounded-tl-sm px-4 py-4"
                >
                  <p className="text-sm text-foreground leading-relaxed">
                    {result.answer}
                  </p>
                </div>

                {/* Key Points */}
                {result.keyPoints.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/20"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      <p
                        className="text-sm font-semibold text-yellow-600
                        dark:text-yellow-400"
                      >
                        Key Points
                      </p>
                    </div>
                    <ul className="space-y-2">
                      {result.keyPoints.map((point, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + i * 0.06 }}
                          className="flex items-start gap-2 text-sm text-foreground"
                        >
                          <Badge
                            className="text-xs bg-yellow-500/10 text-yellow-600
                              dark:text-yellow-400 border-0 shrink-0 mt-0.5"
                          >
                            {i + 1}
                          </Badge>
                          {point}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Precautions */}
                {result.precautions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      <p
                        className="text-sm font-semibold text-blue-600
                        dark:text-blue-400"
                      >
                        Precautions
                      </p>
                    </div>
                    <ul className="space-y-2">
                      {result.precautions.map((p, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + i * 0.06 }}
                          className="flex items-start gap-2 text-sm text-foreground"
                        >
                          <span className="text-blue-500 mt-0.5 shrink-0">
                            •
                          </span>
                          {p}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Disclaimer */}
                {result.disclaimer && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start gap-2 px-3 py-2 rounded-xl
                      bg-muted/50 border border-border"
                  >
                    <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground italic">
                      {result.disclaimer}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
