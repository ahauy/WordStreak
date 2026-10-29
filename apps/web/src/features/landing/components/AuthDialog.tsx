import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface AuthDialogProps {
  isOpen: boolean;
  initialMode: "login" | "signup";
  onClose: () => void;
}

export function AuthDialog({ isOpen, initialMode, onClose }: AuthDialogProps) {
  if (!isOpen) return null;

  return (
    <AuthDialogModal
      key={`${isOpen}-${initialMode}`}
      initialMode={initialMode}
      onClose={onClose}
    />
  );
}

function AuthDialogModal({
  initialMode,
  onClose,
}: {
  initialMode: "login" | "signup";
  onClose: () => void;
}) {
  const { t } = useTranslation("landing");
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    document.body.classList.add("modal-open");
    // showModal (not the open attribute) is what puts the dialog in the top
    // layer, centres it, paints ::backdrop and gives Escape-to-close.
    if (!el.open) el.showModal();
    const firstField = el.querySelector<HTMLElement>(
      initialMode === "signup" ? "#authName" : "#authEmail",
    );
    window.requestAnimationFrame(() => firstField?.focus());
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [initialMode]);

  const isSignup = mode === "signup";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (isSignup && name.trim().length < 2) {
      setNameError(t("auth.errName", "Vui lòng nhập tên của bạn."));
      hasError = true;
    } else {
      setNameError("");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setEmailError(t("auth.errEmail", "Email chưa đúng định dạng."));
      hasError = true;
    } else {
      setEmailError("");
    }

    if (password.length < 8) {
      setPasswordError(t("auth.errPassword", "Mật khẩu cần ít nhất 8 ký tự."));
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (hasError) return;

    // Show success state
    setIsSuccess(true);
  };

  const handleSwitchMode = () => {
    setMode(isSignup ? "login" : "signup");
    setNameError("");
    setEmailError("");
    setPasswordError("");
  };

  return (
    <dialog
      ref={dialogRef}
      className="auth-dialog"
      aria-labelledby="authTitle"
      onClose={onClose}
    >
      <div className="dialog-body">
        <button
          className="dialog-close"
          type="button"
          onClick={onClose}
          aria-label="Đóng hộp thoại"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>

        {!isSuccess ? (
          <div className="auth-form-wrap" id="authFormWrap">
            <div className="auth-head">
              <svg className="auth-seal" viewBox="0 0 48 48" aria-hidden="true">
                <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="1" />
                <path
                  d="M24 11c2.6 4.4 5.6 6.6 5.6 11.4a5.6 5.6 0 0 1-11.2 0c0-3.8 2.6-6.6 5.6-11.4z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
              <h2 className="auth-title" id="authTitle">
                {isSignup
                  ? t("auth.signupTitle", "Bắt đầu ngọn lửa của bạn")
                  : t("auth.loginTitle", "Chào bạn trở lại.")}
              </h2>
              <p className="auth-sub" id="authSub">
                {isSignup
                  ? t("auth.signupSub", "Miễn phí trọn đời. Không cần thẻ tín dụng.")
                  : t("auth.loginSub", "Đăng nhập để giữ chuỗi ngày học tiếp tục.")}
              </p>
            </div>

            <form id="authForm" onSubmit={handleSubmit} noValidate>
              {isSignup && (
                <div className="field" id="nameField">
                  <label htmlFor="authName">{t("auth.name", "Tên của bạn")}</label>
                  <input
                    id="authName"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("auth.namePlaceholder", "Ví dụ: Minh Anh")}
                    aria-invalid={!!nameError}
                  />
                  {nameError && <p className="field-error">{nameError}</p>}
                </div>
              )}

              <div className="field">
                <label htmlFor="authEmail">{t("auth.email", "Email")}</label>
                <input
                  id="authEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("auth.emailPlaceholder", "ban@example.com")}
                  aria-invalid={!!emailError}
                />
                {emailError && <p className="field-error">{emailError}</p>}
              </div>

              <div className="field">
                <label htmlFor="authPassword">{t("auth.password", "Mật khẩu")}</label>
                <input
                  id="authPassword"
                  name="password"
                  type="password"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    isSignup
                      ? t("auth.passwordPlaceholder", "Ít nhất 8 ký tự")
                      : t("auth.passwordLoginPlaceholder", "Mật khẩu của bạn")
                  }
                  aria-invalid={!!passwordError}
                />
                {passwordError && <p className="field-error">{passwordError}</p>}
              </div>

              <button className="btn btn-solid btn-block" type="submit" id="authSubmit">
                {isSignup
                  ? t("auth.submitSignup", "Tạo tài khoản miễn phí")
                  : t("auth.submitLogin", "Đăng nhập")}
              </button>

              <p className="auth-switch">
                <span>
                  {isSignup
                    ? t("auth.haveAccount", "Đã có tài khoản?")
                    : t("auth.noAccount", "Chưa có tài khoản?")}
                </span>{" "}
                <button type="button" onClick={handleSwitchMode}>
                  {isSignup
                    ? t("auth.toLogin", "Đăng nhập")
                    : t("auth.toSignup", "Tạo tài khoản")}
                </button>
              </p>
            </form>
          </div>
        ) : (
          <div className="auth-success" id="authSuccess">
            <svg className="success-mark" viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M15 24l6 6 13-14" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <h2 className="auth-title">{t("auth.successTitle", "Đã ghi nhận.")}</h2>
            <p className="auth-sub">
              {t(
                "auth.successBody",
                "Bản xem trước này chưa tạo tài khoản hay đăng nhập thật. Khi tích hợp, bước này sẽ gửi email xác nhận.",
              )}
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button
                className="btn btn-solid"
                type="button"
                style={{ flex: 1 }}
                onClick={() => {
                  onClose();
                  navigate(isSignup ? "/register" : "/login");
                }}
              >
                {isSignup ? t("auth.toSignup", "Đến trang đăng ký") : t("auth.toLogin", "Đến trang đăng nhập")}
              </button>
              <button className="btn btn-quiet" type="button" onClick={onClose}>
                {t("auth.close", "Đóng")}
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
