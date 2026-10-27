import { useTranslation } from "react-i18next";

export function FAQSection() {
  const { t } = useTranslation("landing");

  return (
    <section className="faq section" id="hoi-dap">
      <div className="wrap faq-grid">
        <div className="section-intro">
          <p className="eyebrow">{t("faq.eyebrow", "Hỏi đáp")}</p>
          <h2
            className="display display-sm"
            dangerouslySetInnerHTML={{
              __html: t("faq.title", "Những điều<br><em>cần biết.</em>"),
            }}
          />
          <p className="section-lede">
            {t(
              "faq.lede",
              "Về phương pháp lặp lại ngắt quãng, chuỗi ngày học và dữ liệu của bạn.",
            )}
          </p>
        </div>

        <div className="faq-list">
          <details name="faq">
            <summary>
              <span className="faq-num">01</span>
              <span>{t("faq.q1", "WordStreak có thật sự miễn phí không?")}</span>
              <span className="faq-icon" aria-hidden="true"></span>
            </summary>
            <div className="faq-answer">
              <p>
                {t(
                  "faq.a1",
                  "Có. Toàn bộ thuật toán SM-2, không giới hạn thẻ, tra cứu AI và theo dõi chuỗi ngày đều miễn phí. Không có gói trả phí ẩn và không cần thẻ tín dụng.",
                )}
              </p>
            </div>
          </details>

          <details name="faq">
            <summary>
              <span className="faq-num">02</span>
              <span>{t("faq.q2", "Thuật toán SM-2 hoạt động như thế nào?")}</span>
              <span className="faq-icon" aria-hidden="true"></span>
            </summary>
            <div className="faq-answer">
              <p>
                {t(
                  "faq.a2",
                  "SM-2 tính khoảng cách ôn dựa trên mức độ dễ nhớ của từng từ. Từ được đánh giá “Dễ” sẽ được dời xa hơn; từ “Khó” sẽ quay lại sớm hơn, ngay trước khi bạn quên.",
                )}
              </p>
            </div>
          </details>

          <details name="faq">
            <summary>
              <span className="faq-num">03</span>
              <span>
                {t("faq.q3", "Tôi có thể nhập bộ từ từ Anki hoặc Quizlet không?")}
              </span>
              <span className="faq-icon" aria-hidden="true"></span>
            </summary>
            <div className="faq-answer">
              <p>
                {t(
                  "faq.a3",
                  "Có. WordStreak nhận CSV, JSON và bộ từ Anki (.apkg). Trình phân tích sẽ ánh xạ từ vựng, phiên âm, định nghĩa và câu ví dụ vào bộ thẻ mới.",
                )}
              </p>
            </div>
          </details>

          <details name="faq">
            <summary>
              <span className="faq-num">04</span>
              <span>
                {t("faq.q4", "Khiên đóng băng chuỗi dùng để làm gì?")}
              </span>
              <span className="faq-icon" aria-hidden="true"></span>
            </summary>
            <div className="faq-answer">
              <p>
                {t(
                  "faq.a4",
                  "Khi có việc bận đột xuất, khiên sẽ bảo vệ chuỗi ngày học của bạn khi bạn lỡ một ngày — chuỗi không bị đứt, thói quen vẫn được giữ.",
                )}
              </p>
            </div>
          </details>

          <details name="faq">
            <summary>
              <span className="faq-num">05</span>
              <span>
                {t("faq.q5", "Tôi có thể học khi không có mạng không?")}
              </span>
              <span className="faq-icon" aria-hidden="true"></span>
            </summary>
            <div className="faq-answer">
              <p>
                {t(
                  "faq.a5",
                  "Có. WordStreak lưu dữ liệu cục bộ trước, nên bạn vẫn ôn thẻ và làm bài offline. Mọi thay đổi sẽ đồng bộ khi kết nối trở lại.",
                )}
              </p>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
