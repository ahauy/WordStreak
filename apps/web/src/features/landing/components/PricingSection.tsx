import { useTranslation } from "react-i18next";

interface PricingSectionProps {
  onOpenAuth: (mode: "login" | "signup") => void;
}

export function PricingSection({ onOpenAuth }: PricingSectionProps) {
  const { t } = useTranslation("landing");

  return (
    <section className="pricing section" id="hoc-phi">
      <div className="wrap pricing-grid">
        <div className="section-intro">
          <p className="eyebrow">{t("pricing.eyebrow", "Học phí")}</p>
          <h2
            className="display display-sm"
            dangerouslySetInnerHTML={{
              __html: t("pricing.title", "Một mức giá:<br><em>không đồng.</em>"),
            }}
          />
          <p className="section-lede">
            {t(
              "pricing.lede",
              "WordStreak miễn phí trọn đời. Không bậc thang ẩn, không paywall, không cần thẻ tín dụng.",
            )}
          </p>
          <svg className="flourish" viewBox="0 0 220 14" aria-hidden="true">
            <path d="M0 7h86M134 7h86" stroke="currentColor" strokeWidth="1" />
            <path d="M110 1l6 6-6 6-6-6z" fill="currentColor" />
          </svg>
        </div>

        <div className="price-card">
          <div className="price-head">
            <span>{t("pricing.plan", "Gói duy nhất")}</span>
            <span className="price-badge">{t("pricing.badge", "Trọn đời")}</span>
          </div>
          <p className="price-amount">
            <span className="amount">0</span>
            <span className="currency">₫</span>
          </p>
          <p className="price-note">
            {t("pricing.note", "Miễn phí cho mọi người học, mãi mãi.")}
          </p>
          <ul className="price-list">
            <li>{t("pricing.item1", "Không giới hạn thẻ từ")}</li>
            <li>{t("pricing.item2", "Thuật toán SM-2 đầy đủ")}</li>
            <li>{t("pricing.item3", "Tra cứu và tạo thẻ bằng AI")}</li>
            <li>{t("pricing.item4", "Xuất Anki, CSV và JSON")}</li>
            <li>{t("pricing.item5", "Đồng bộ ngoại tuyến đa thiết bị")}</li>
            <li>{t("pricing.item6", "Không quảng cáo, không paywall")}</li>
          </ul>
          <button
            className="btn btn-solid btn-block"
            type="button"
            onClick={() => onOpenAuth("signup")}
          >
            {t("pricing.cta", "Tạo tài khoản miễn phí")}
          </button>
          <p className="price-fine">
            {t("pricing.fine", "Không cần thẻ tín dụng.")}
          </p>
        </div>
      </div>
    </section>
  );
}
