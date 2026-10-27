import { useTranslation } from "react-i18next";

interface FinaleSectionProps {
  onOpenAuth: (mode: "login" | "signup") => void;
}

export function FinaleSection({ onOpenAuth }: FinaleSectionProps) {
  const { t } = useTranslation("landing");

  return (
    <section className="finale" aria-labelledby="finaleTitle">
      <div className="finale-art" aria-hidden="true">
        <svg viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice">
          <defs>
            <radialGradient id="finaleGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#e8b062" stopOpacity="0.36" />
              <stop offset="1" stopColor="#e8b062" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="720" cy="430" rx="520" ry="240" fill="url(#finaleGlow)" />
          <g fill="none" stroke="#3a2c1b" strokeWidth="3" opacity="0.9">
            <path d="M120 520C160 420 150 330 120 250M150 380C120 340 92 330 60 330M140 330C178 292 210 284 246 288" />
            <path d="M1320 520C1280 412 1296 320 1338 236M1290 372C1338 330 1376 322 1416 326M1302 318C1264 280 1232 272 1196 276" />
          </g>
          <g fill="#201a10" opacity="0.85">
            <path d="M180 250c50-46 118-42 150 8 46-26 102 0 96 50 40 30 22 92-32 92-38 32-100 20-122-16-52 10-92-34-78-76-30-22-34-42-14-58z" />
            <path d="M1180 250c-50-46-118-42-150 8-46-26-102 0-96 50-40 30-22 92 32 92 38 32 100 20 122-16 52 10 92-34 78-76 30-22 34-42 14-58z" />
          </g>
        </svg>
      </div>
      <div className="wrap finale-inner">
        <svg className="finale-seal" viewBox="0 0 80 80" role="presentation" aria-hidden="true">
          <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="1" />
          <path
            d="M40 18c4 7 9 10 9 18a9 9 0 0 1-18 0c0-6 4-10 9-18z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
          />
        </svg>
        <p className="eyebrow">{t("finale.eyebrow", "Bắt đầu hôm nay")}</p>
        <h2
          className="display"
          id="finaleTitle"
          dangerouslySetInnerHTML={{
            __html: t("finale.title", "Ngọn lửa nhỏ,<br><em>mỗi ngày.</em>"),
          }}
        />
        <p className="finale-body">
          {t(
            "finale.body",
            "Một từ mới. Một lần ôn đúng lúc. Một chuỗi ngày không bỏ. Vốn từ của bạn lớn lên từ những điều nhỏ nhất.",
          )}
        </p>
        <div className="finale-actions">
          <button
            className="btn btn-solid btn-lg"
            type="button"
            onClick={() => onOpenAuth("signup")}
          >
            {t("finale.cta", "Tạo tài khoản miễn phí")}
          </button>
          <button
            className="btn btn-quiet btn-lg"
            type="button"
            onClick={() => onOpenAuth("login")}
          >
            {t("finale.signin", "Đăng nhập")}
          </button>
        </div>
        <p className="finale-note">
          {t("finale.note", "Miễn phí trọn đời · Không quảng cáo · Dữ liệu thuộc về bạn")}
        </p>
      </div>
    </section>
  );
}
