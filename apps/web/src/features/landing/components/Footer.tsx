import { useTranslation } from "react-i18next";

interface FooterProps {
  onScrollToProgress: (fraction: number) => void;
  onOpenAuth: (mode: "login" | "signup") => void;
}

export function Footer({ onScrollToProgress, onOpenAuth }: FooterProps) {
  const { t } = useTranslation("landing");

  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <a
            className="brand"
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            aria-label="WordStreak — về đầu trang"
          >
            <svg className="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
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
          <p className="footer-manifesto">
            {t(
              "footer.manifesto",
              "Nền tảng học từ vựng tiếng Anh mã nguồn mở, ứng dụng lặp lại ngắt quãng để giúp việc ghi nhớ trở nên bền bỉ.",
            )}
          </p>
          <p className="footer-status">
            {t("footer.status", "Mã nguồn mở · Dữ liệu thuộc về bạn")}
          </p>
        </div>

        <div className="footer-col">
          <h3>{t("footer.col1", "Học tập")}</h3>
          <a
            href="#khoi-dau"
            onClick={(e) => {
              e.preventDefault();
              onScrollToProgress(0.46);
            }}
          >
            {t("footer.c1", "Cách học")}
          </a>
          <a
            href="#khoi-dau"
            onClick={(e) => {
              e.preventDefault();
              onScrollToProgress(0.68);
            }}
          >
            {t("footer.c2", "Tính năng")}
          </a>
          <a href="#hoc-phi">{t("footer.c3", "Học phí")}</a>
          <a href="#hoi-dap">{t("footer.c4", "Hỏi đáp")}</a>
        </div>

        <div className="footer-col">
          <h3>{t("footer.col2", "Sản phẩm")}</h3>
          <button type="button" onClick={() => onOpenAuth("signup")}>
            {t("footer.c5", "Tạo tài khoản")}
          </button>
          <button type="button" onClick={() => onOpenAuth("login")}>
            {t("footer.c6", "Đăng nhập")}
          </button>
          <a
            href="#khoi-dau"
            onClick={(e) => {
              e.preventDefault();
              onScrollToProgress(0.89);
            }}
          >
            {t("footer.c7", "Dữ liệu & xuất thẻ")}
          </a>
        </div>

        <div className="footer-col footer-meta">
          <h3>{t("footer.col3", "Ghi chú")}</h3>
          <p>{t("footer.meta1", "Lặp lại ngắt quãng SM-2")}</p>
          <p>{t("footer.meta2", "IPA · Anki · CSV · JSON")}</p>
          <p>{t("footer.meta3", "Hoạt động ngoại tuyến")}</p>
        </div>
      </div>

      <div className="wrap footer-bottom">
        <p>{t("footer.rights", "© 2026 WordStreak. Dành cho người học ngôn ngữ trên toàn thế giới.")}</p>
        <a
          href="#top"
          className="back-top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          {t("footer.top", "Về đầu trang ↑")}
        </a>
      </div>
    </footer>
  );
}
