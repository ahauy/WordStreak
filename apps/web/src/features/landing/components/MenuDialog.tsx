import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface MenuDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onScrollToProgress: (fraction: number) => void;
  onOpenAuth: (mode: "login" | "signup") => void;
}

export function MenuDialog({
  isOpen,
  onClose,
  onScrollToProgress,
  onOpenAuth,
}: MenuDialogProps) {
  const { t } = useTranslation("landing");

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog className="menu-dialog" open aria-label="Menu">
      <div className="menu-inner">
        <button
          className="dialog-close"
          type="button"
          onClick={onClose}
          aria-label="Đóng menu"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>

        <nav className="menu-nav" aria-label="Menu di động">
          <button
            type="button"
            onClick={() => {
              onClose();
              onScrollToProgress(0);
            }}
          >
            <span>I</span>
            <span>{t("nav.story", "Câu chuyện")}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onScrollToProgress(0.46);
            }}
          >
            <span>II</span>
            <span>{t("nav.ritual", "Nghi lễ")}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onScrollToProgress(0.68);
            }}
          >
            <span>III</span>
            <span>{t("nav.trove", "Kho tàng")}</span>
          </button>
          <a
            href="#hoc-phi"
            onClick={() => {
              onClose();
            }}
          >
            <span>IV</span>
            <span>{t("nav.pricing", "Học phí")}</span>
          </a>
          <a
            href="#hoi-dap"
            onClick={() => {
              onClose();
            }}
          >
            <span>V</span>
            <span>{t("nav.faq", "Hỏi đáp")}</span>
          </a>
        </nav>

        <div className="menu-actions">
          <button
            className="btn btn-quiet btn-block"
            type="button"
            onClick={() => {
              onClose();
              onOpenAuth("login");
            }}
          >
            {t("nav.signin", "Đăng nhập")}
          </button>
          <button
            className="btn btn-solid btn-block"
            type="button"
            onClick={() => {
              onClose();
              onOpenAuth("signup");
            }}
          >
            {t("nav.start", "Vào học")}
          </button>
        </div>
      </div>
    </dialog>
  );
}
