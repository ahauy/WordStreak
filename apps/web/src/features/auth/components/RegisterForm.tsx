import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "../../../common/components/Input";
import { Button } from "../../../common/components/Button";
import { useAuthStore } from "../../../store/useAuthStore";
import { PurpleStreakFlame } from "../../landing/components/PurpleStreakFlame";

const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username cannot exceed 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain alphanumeric characters and underscores",
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least 1 uppercase letter and 1 number",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onNavigateToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onNavigateToLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register: registerUser,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const passwordValue = useWatch({ control, name: "password" }) || "";
  const confirmPasswordValue =
    useWatch({ control, name: "confirmPassword" }) || "";

  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasNumber = /\d/.test(passwordValue);
  const isMatch = Boolean(
    passwordValue &&
    confirmPasswordValue &&
    passwordValue === confirmPasswordValue,
  );

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    try {
      await registerUser({
        email: data.email,
        username: data.username,
        password: data.password,
      });
      onSuccess?.();
    } catch {
      // Handled in store
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md bg-white border border-[#e5e5e5] rounded-2xl p-7 sm:p-9 shadow-xs relative"
    >
      {/* Mobile Brand Header */}
      <div className="lg:hidden flex items-center justify-center gap-2 mb-5">
        <PurpleStreakFlame size="sm" showEmbers={false} />
        <span
          className="text-xl font-extrabold text-black tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          WordStreak
        </span>
      </div>

      <div className="text-center mb-5">
        <h2
          className="text-3xl sm:text-[32px] font-bold text-black mb-1.5 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Create Free Account
        </h2>
        <p className="text-sm text-[#737373]">
          Start building permanent vocabulary in 5 minutes a day
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          role="alert"
          className="mb-5 p-3 rounded-xl bg-[#fff5f5] border border-[#ff5f56]/30 flex items-start gap-2.5 text-[#dc2626] text-xs transition-all"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </motion.div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3.5"
        noValidate
      >
        <Input
          id="register-email"
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="you@wordstreak.app"
          required
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          id="register-username"
          label="Username"
          type="text"
          autoComplete="username"
          placeholder="streakmaster"
          required
          leftIcon={<User className="w-4 h-4" />}
          error={errors.username?.message}
          {...register("username")}
        />

        <Input
          id="register-password"
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="••••••••"
          required
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-[#737373] hover:text-black transition-colors focus:outline-none cursor-pointer p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
          error={errors.password?.message}
          {...register("password")}
        />

        {/* Real-time Password Strength Criteria Checklist */}
        {passwordValue && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-3 bg-[#fafafa] rounded-xl border border-[#e5e5e5] space-y-1.5 text-xs"
          >
            <p className="font-semibold text-black mb-1">
              Password requirements:
            </p>
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                  hasMinLength ? "text-[#27c93f]" : "text-[#d4d4d4]"
                }`}
              />
              <span
                className={
                  hasMinLength ? "text-black font-medium" : "text-[#737373]"
                }
              >
                At least 8 characters
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                  hasUppercase ? "text-[#27c93f]" : "text-[#d4d4d4]"
                }`}
              />
              <span
                className={
                  hasUppercase ? "text-black font-medium" : "text-[#737373]"
                }
              >
                1 uppercase letter (A-Z)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                  hasNumber ? "text-[#27c93f]" : "text-[#d4d4d4]"
                }`}
              />
              <span
                className={
                  hasNumber ? "text-black font-medium" : "text-[#737373]"
                }
              >
                1 number (0-9)
              </span>
            </div>
          </motion.div>
        )}

        <Input
          id="register-confirm-password"
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="••••••••"
          required
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="text-[#737373] hover:text-black transition-colors focus:outline-none cursor-pointer p-1"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
          error={errors.confirmPassword?.message}
          helperText={
            isMatch && !errors.confirmPassword ? "✓ Passwords match" : undefined
          }
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2 h-11 text-sm font-medium"
          isLoading={isLoading}
          leftIcon={<UserPlus className="w-4 h-4" />}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Create Free Account
        </Button>
      </form>

      {onNavigateToLogin && (
        <div className="text-center mt-6 pt-5 border-t border-[#e5e5e5]">
          <p className="text-xs text-[#737373]">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-semibold text-black hover:text-[#7e22ce] hover:underline transition-colors focus:outline-none cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </div>
      )}
    </motion.div>
  );
};
