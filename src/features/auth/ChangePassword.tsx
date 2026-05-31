import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle,
  KeyRound,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useChangePasswordMutation, useAuth } from "../../hooks/useAuth";
import { ROLES, ROUTES } from "../../config/constants";

// ── Zod schema ─────────────────────────────────────────────
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),

    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// ── Password strength checker ──────────────────────────────
function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
  if (score === 3) return { score, label: "Fair", color: "bg-yellow-500" };
  if (score === 4) return { score, label: "Good", color: "bg-blue-500" };
  return { score, label: "Strong", color: "bg-primary-500" };
}

// ── Requirement check item ─────────────────────────────────
function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div
      className={`flex items-center gap-2 text-xs transition-colors ${
        met ? "text-primary-600 dark:text-primary-400" : "text-muted-foreground"
      }`}
    >
      <CheckCircle
        className={`w-3.5 h-3.5 shrink-0 transition-colors ${
          met ? "text-primary-500" : "text-muted-foreground/40"
        }`}
      />
      {label}
    </div>
  );
}

// ── Animation variants ─────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const { mutate: changePassword, isPending } = useChangePasswordMutation();

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [success, setSuccess] = useState(false);

  // Back route depends on role
  const backRoute =
    role === ROLES.ADMIN ? ROUTES.ADMIN_DASHBOARD : ROUTES.FARMER_DASHBOARD;

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = form.watch("newPassword");
  const strength = getPasswordStrength(newPasswordValue);

  function onSubmit(values: ChangePasswordFormValues) {
    changePassword(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmPassword, // ← map here
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => {
            navigate(backRoute, { replace: true });
          }, 2500);
        },
      },
    );
  }

  // ── Success screen ─────────────────────────────────────
  if (success) {
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
            🔐
          </motion.div>
          <div className="w-16 h-16 rounded-full bg-primary-500/15 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Password Updated!
          </h2>
          <p className="text-muted-foreground text-sm">
            Your password has been changed successfully. Redirecting...
          </p>
          <motion.div className="h-1 bg-primary-500/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(backRoute)}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">
            Change Password
          </h1>
          <p className="text-muted-foreground text-sm">
            Update your account password securely
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
            {/* ── Security notice ── */}
            <motion.div variants={itemVariants}>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-primary-500/8 border border-primary-500/20">
                <ShieldCheck className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Security Tip
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Use a strong password with uppercase letters, numbers, and
                    special characters. Never share your password with anyone.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ── Password fields card ── */}
            <motion.div variants={itemVariants}>
              <Card className="border-border">
                <CardHeader className="pb-2 pt-6 px-6">
                  <CardTitle className="font-display text-base flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-primary-500" />
                    Update Password
                  </CardTitle>
                  <CardDescription>
                    Enter your current password and choose a new one
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-6 pb-6 space-y-5">
                  {/* Current password */}
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Current Password{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="Enter your current password"
                              className="pl-10 pr-10 h-11"
                              type={show.current ? "text" : "password"}
                              autoComplete="current-password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShow((s) => ({ ...s, current: !s.current }))
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {show.current ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-3 text-muted-foreground">
                        New Password
                      </span>
                    </div>
                  </div>

                  {/* New password */}
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          New Password{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="Enter new password"
                              className="pl-10 pr-10 h-11"
                              type={show.new ? "text" : "password"}
                              autoComplete="new-password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShow((s) => ({ ...s, new: !s.new }))
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {show.new ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />

                        {/* Strength meter */}
                        {newPasswordValue && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                Password strength
                              </span>
                              <Badge
                                variant="secondary"
                                className={`text-xs text-white border-0 ${strength.color}`}
                              >
                                {strength.label}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <motion.div
                                  key={i}
                                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                    i <= strength.score
                                      ? strength.color
                                      : "bg-muted"
                                  }`}
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  transition={{ delay: i * 0.05 }}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </FormItem>
                    )}
                  />

                  {/* Confirm password */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          Confirm New Password{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="Re-enter new password"
                              className="pl-10 pr-10 h-11"
                              type={show.confirm ? "text" : "password"}
                              autoComplete="new-password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShow((s) => ({ ...s, confirm: !s.confirm }))
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {show.confirm ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Password requirements ── */}
            <motion.div variants={itemVariants}>
              <Card className="border-border">
                <CardContent className="px-5 py-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Password Requirements
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Requirement
                      met={newPasswordValue.length >= 8}
                      label="At least 8 characters"
                    />
                    <Requirement
                      met={/[A-Z]/.test(newPasswordValue)}
                      label="One uppercase letter"
                    />
                    <Requirement
                      met={/[0-9]/.test(newPasswordValue)}
                      label="One number"
                    />
                    <Requirement
                      met={/[^A-Za-z0-9]/.test(newPasswordValue)}
                      label="One special character"
                    />
                    <Requirement
                      met={
                        newPasswordValue.length > 0 &&
                        newPasswordValue !== form.watch("currentPassword")
                      }
                      label="Different from current"
                    />
                    <Requirement
                      met={newPasswordValue.length >= 12}
                      label="12+ chars (recommended)"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Actions ── */}
            <motion.div variants={itemVariants} className="flex gap-3 pb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(backRoute)}
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
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Update Password
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
