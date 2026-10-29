import { useTranslation } from "react-i18next";

interface NavbarProps {
  isSolid: boolean;
  onScrollToProgress: (progress: number) => void;
  onOpenAuth: (mode: "login" | "signup") => void;
  onOpenMenu: () => void;
}

export function Navbar({
  isSolid,
  onScrollToProgress,
  onOpenAuth,
  onOpenMenu,
}: NavbarProps) {
  const { t, i18n } = useTranslation("landing");
  const currentLang = i18n.language.startsWith("en") ? "en" : "vi";

  const handleSetLang = (lang: "vi" | "en") => {
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem("ws-lang", lang);
      localStorage.setItem("i18nextLng", lang);
    } catch {
      // ignore
    }
  };

  return (
    <header className={`site-header ${isSolid ? "is-solid" : ""}`} id="siteHeader">
      <div className="header-inner">
        <a
          className="brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          aria-label="WordStreak — về đầu trang"
        >
          <svg className="brand-mark" viewBox="0 0 40 40" role="presentation" aria-hidden="true">
            <path
              d="M20 5c4 6 8 9 8 16a8 8 0 0 1-16 0c0-5 3-9 8-16z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M20 16c1.8 3 3.6 4.5 3.6 8a3.6 3.6 0 0 1-7.2 0c0-2.6 1.5-4.6 3.6-8z"
              fill="currentColor"
              opacity=".85"
            />
          </svg>
          <span className="brand-name">WordStreak</span>
        </a>

        <nav className="site-nav" aria-label="Điều hướng chính">
          <button
            className="nav-link"
            type="button"
            onClick={() => onScrollToProgress(0)}
          >
            {t("nav.story", "Câu chuyện")}
          </button>
          <button
            className="nav-link"
            type="button"
            onClick={() => onScrollToProgress(0.46)}
          >
            {t("nav.ritual", "Nghi lễ")}
          </button>
          <button
            className="nav-link"
            type="button"
            onClick={() => onScrollToProgress(0.68)}
          >
            {t("nav.trove", "Kho tàng")}
          </button>
          <a className="nav-link" href="#hoc-phi">
            {t("nav.pricing", "Học phí")}
          </a>
          <a className="nav-link" href="#hoi-dap">
            {t("nav.faq", "Hỏi đáp")}
          </a>
        </nav>

        <div className="header-actions">
          <div className="lang-switch" role="group" aria-label="Ngôn ngữ">
            <button
              className={`lang-btn ${currentLang === "vi" ? "is-active" : ""}`}
              type="button"
              onClick={() => handleSetLang("vi")}
              aria-pressed={currentLang === "vi"}
            >
              VI
            </button>
            <span className="lang-sep" aria-hidden="true">
              /
            </span>
            <button
              className={`lang-btn ${currentLang === "en" ? "is-active" : ""}`}
              type="button"
              onClick={() => handleSetLang("en")}
              aria-pressed={currentLang === "en"}
            >
              EN
            </button>
          </div>

          <button
            className="btn btn-ghost header-signin"
            type="button"
            onClick={() => onOpenAuth("login")}
          >
            {t("nav.signin", "Đăng nhập")}
          </button>

          <button
            className="btn btn-solid header-start"
            type="button"
            onClick={() => onOpenAuth("signup")}
          >
            {t("nav.start", "Vào học")}
          </button>

          <button
            className="menu-toggle"
            type="button"
            id="menuToggle"
            aria-label="Mở menu"
            onClick={onOpenMenu}
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
