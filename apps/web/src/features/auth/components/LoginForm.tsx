import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "../../../common/components/Input";
import { Button } from "../../../common/components/Button";
import { useAuthStore } from "../../../store/useAuthStore";
import { PurpleStreakFlame } from "../../landing/components/PurpleStreakFlame";
import { useTranslation } from "react-i18next";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onNavigateToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onNavigateToRegister,
}) => {
  const { t } = useTranslation(["auth", "common"]);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { login, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    try {
      await login({
        identifier: data.identifier,
        password: data.password,
      });
      onSuccess?.();
    } catch {
      // Error handled in store
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

      <div className="text-center mb-6">
        <h2
          className="text-3xl sm:text-[32px] font-bold text-black mb-1.5 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("auth:login.title", "Welcome Back")}
        </h2>
        <p className="text-sm text-[#737373]">
          {t("auth:login.subtitle", "Sign in to keep your daily streak alive")}
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          id="login-identifier"
          label={t("auth:login.emailLabel", "Email or Username")}
          type="text"
          autoComplete="username"
          placeholder={t("auth:login.emailPlaceholder", "you@example.com")}
          required
          leftIcon={<User className="w-4 h-4" />}
          error={errors.identifier?.message}
          {...register("identifier")}
        />

        <div className="space-y-1.5">
          <Input
            id="login-password"
            label={t("auth:login.passwordLabel", "Password")}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder={t("auth:login.passwordPlaceholder", "••••••••")}
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

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-[#525252] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#d4d4d4] bg-[#fafafa] text-[#9333ea] focus:ring-[#9333ea] cursor-pointer accent-[#9333ea]"
              />
              <span>{t("auth:login.rememberMe", "Remember me")}</span>
            </label>

            <button
              type="button"
              onClick={() =>
                alert(
                  t(
                    "auth:forgotPassword.subtitle",
                    "Password reset instructions will be sent to your registered email.",
                  ),
                )
              }
              className="text-xs font-medium text-[#737373] hover:text-black hover:underline transition-colors focus:outline-none cursor-pointer"
            >
              {t("auth:login.forgotPassword", "Forgot password?")}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2 h-11 text-sm font-medium"
          isLoading={isLoading}
          leftIcon={<LogIn className="w-4 h-4" />}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {isLoading
            ? t("auth:login.signingIn", "Signing in...")
            : t("auth:login.submitButton", "Sign In")}
        </Button>
      </form>

      {onNavigateToRegister && (
        <div className="text-center mt-6 pt-5 border-t border-[#e5e5e5]">
          <p className="text-xs text-[#737373]">
            {t("auth:login.noAccount", "Don't have an account?")}{" "}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="font-semibold text-black hover:text-[#7e22ce] hover:underline transition-colors focus:outline-none cursor-pointer"
            >
              {t("auth:login.signUpLink", "Sign up for free")}
            </button>
          </p>
        </div>
      )}
    </motion.div>
  );
};
