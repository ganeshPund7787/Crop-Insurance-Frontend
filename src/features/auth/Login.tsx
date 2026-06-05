import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Leaf, LogIn, Mail, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { useLoginMutation, useAuth } from "../../hooks/useAuth";
import { ROLES, ROUTES } from "../../config/constants";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Min 6 characters"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const { mutate: login, isPending } = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  // ── ALL hooks must be called before any return ─────────
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // ── Redirect if already authenticated ──────────────────
  if (isAuthenticated) {
    if (role === ROLES.ADMIN)
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    if (role === ROLES.INSURANCE_AGENT)
      return <Navigate to={ROUTES.AGENT_DASHBOARD} replace />;
    return <Navigate to={ROUTES.FARMER_DASHBOARD} replace />;
  }

  function onSubmit(values: LoginFormValues) {
    login(values, {
      onSuccess: (response) => {
        const role = response.data.role;
        if (role === ROLES.ADMIN) {
          navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
        } else if (role === ROLES.INSURANCE_AGENT) {
          navigate(ROUTES.AGENT_DASHBOARD, { replace: true });
        } else {
          navigate(ROUTES.FARMER_DASHBOARD, { replace: true });
        }
      },
    });
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ── */}
      <motion.div
        className="hidden lg:flex flex-col justify-between w-[52%] bg-green-gradient p-12 relative overflow-hidden"
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="absolute top-[-80px] right-[-80px] w-[320px] h-[320px] rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[260px] h-[260px] rounded-full bg-white/5" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-white text-xl font-bold tracking-wide">
            CropShield
          </span>
        </div>

        <motion.div
          className="relative z-10 space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="text-6xl">🌾</div>
          <h1 className="font-display text-white text-4xl font-bold leading-tight">
            Protect Your
            <br />
            <span className="text-primary-300">Harvest,</span>
            <br />
            Secure Your Future
          </h1>
          <p className="text-primary-200 text-lg leading-relaxed max-w-sm">
            India's most trusted crop insurance platform — empowering farmers
            with smart risk intelligence.
          </p>
          <div className="flex gap-8 pt-4">
            {[
              { value: "2.4L+", label: "Farmers" },
              { value: "₹840Cr", label: "Claims Paid" },
              { value: "18", label: "States" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-white text-2xl font-bold font-display">
                  {stat.value}
                </div>
                <div className="text-primary-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="relative z-10 border-l-2 border-primary-400 pl-4">
          <p className="text-primary-200 text-sm italic">
            "Every seed deserves protection."
          </p>
        </div>
      </motion.div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            className="flex lg:hidden items-center gap-2 mb-8"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-primary-700 dark:text-primary-400 text-lg font-bold">
              CropShield
            </span>
          </motion.div>

          <Card className="border-border shadow-card dark:shadow-card-dark">
            <CardHeader className="pb-2 space-y-1 px-8 pt-8">
              <motion.h2
                variants={itemVariants}
                className="font-display text-2xl font-bold text-foreground"
              >
                Welcome back
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-muted-foreground text-sm"
              >
                Sign in to your CropShield account
              </motion.p>
            </CardHeader>

            <CardContent className="px-8 pb-8 pt-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <motion.div variants={itemVariants}>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                placeholder="you@example.com"
                                className="pl-10 h-11"
                                type="email"
                                autoComplete="email"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                placeholder="••••••••"
                                className="pl-10 pr-10 h-11"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword((p) => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showPassword ? (
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
                  </motion.div>

                  <motion.div variants={itemVariants} className="pt-1">
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-green-glow hover:shadow-none"
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
                          Signing in...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <LogIn className="w-4 h-4" />
                          Sign In
                        </span>
                      )}
                    </Button>
                  </motion.div>

                  <motion.p
                    variants={itemVariants}
                    className="text-center text-sm text-muted-foreground"
                  >
                    Don't have an account?{" "}
                    <Link
                      to={ROUTES.REGISTER}
                      className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                    >
                      Register as Farmer
                    </Link>
                  </motion.p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
