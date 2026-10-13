import React, { useEffect, useState } from "react";
import { Sparkles, Shield, Keyboard, Save, Check, Bell, AlertTriangle } from "lucide-react";
import { extensionStorage } from "../shared/storage";
import { parseTimeToMinutes } from "../background/reminderRules";
import type { ExtensionSettingsPayload } from "@wordstreak/shared-types";

export function getQuietHoursHint(
  settings: Pick<
    ExtensionSettingsPayload,
    "remindersEnabled" | "dailyReminderTime" | "quietHoursStart" | "quietHoursEnd"
  >,
): { type: "overlap" | "disabled"; message: string } | null {
  const startMinutes = parseTimeToMinutes(settings.quietHoursStart);
  const endMinutes = parseTimeToMinutes(settings.quietHoursEnd);

  if (startMinutes === endMinutes) {
    return {
      type: "disabled",
      message: "Giờ yên lặng đang tắt vì giờ bắt đầu trùng giờ kết thúc.",
    };
  }

  if (!settings.remindersEnabled) {
    return null;
  }

  const dailyMinutes = parseTimeToMinutes(settings.dailyReminderTime);
  const isOverlap =
    startMinutes < endMinutes
      ? dailyMinutes >= startMinutes && dailyMinutes < endMinutes
      : dailyMinutes >= startMinutes || dailyMinutes < endMinutes;

  if (isOverlap) {
    return {
      type: "overlap",
      message:
        "Giờ nhắc học hằng ngày đang nằm trong khung Giờ yên lặng - thông báo sẽ bị tạm ẩn vào thời điểm này.",
    };
  }

  return null;
}

export async function saveReminderSettings(
  settings: ExtensionSettingsPayload,
): Promise<ExtensionSettingsPayload> {
  const updated = await extensionStorage.updateSettings(settings);
  try {
    await chrome.runtime?.sendMessage?.({
      type: "UPDATE_SETTINGS",
      payload: updated,
    });
  } catch {
    // Standalone or test context resilience
  }
  return updated;
}

export const QuietHoursHintBanner: React.FC<{
  hint: { type: "overlap" | "disabled"; message: string } | null;
}> = ({ hint }) => {
  if (!hint) return null;
  const isOverlap = hint.type === "overlap";
  return (
    <div
      role="status"
      style={{
        marginTop: "12px",
        padding: "10px 14px",
        borderRadius: "12px",
        fontSize: "12.5px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: isOverlap ? "#fef3c7" : "#f3f4f6",
        border: `1px solid ${isOverlap ? "#fcd34d" : "#e5e5e5"}`,
        color: isOverlap ? "#92400e" : "#4b5563",
      }}
    >
      <AlertTriangle size={16} color={isOverlap ? "#d97706" : "#6b7280"} />
      <span>{hint.message}</span>
    </div>
  );
};

interface ReminderChildControlsProps {
  settings: ExtensionSettingsPayload;
  onUpdate: (updater: (prev: ExtensionSettingsPayload) => ExtensionSettingsPayload) => void;
}

export const ReminderChildControls: React.FC<ReminderChildControlsProps> = ({
  settings,
  onUpdate,
}) => {
  const disabled = !settings.remindersEnabled;
  const hint = getQuietHoursHint(settings);

  return (
    <div
      style={{
        marginTop: "12px",
        padding: "16px",
        backgroundColor: "#fbfbfb",
        borderRadius: "16px",
        border: "1px solid #e5e5e5",
        opacity: disabled ? 0.55 : 1,
        transition: "opacity 0.2s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div>
          <label htmlFor="dailyReminderTime" style={{ fontSize: "14px", fontWeight: 600, color: "#111827", display: "block" }}>
            Giờ nhắc học cố định
          </label>
          <span style={{ fontSize: "12px", color: "#6b7280" }}>Thời điểm gửi thông báo hằng ngày</span>
        </div>
        <input
          id="dailyReminderTime"
          type="time"
          disabled={disabled}
          value={settings.dailyReminderTime}
          onChange={(e) => onUpdate((prev) => ({ ...prev, dailyReminderTime: e.target.value }))}
          style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "13px" }}
        />
      </div>

      <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", cursor: disabled ? "default" : "pointer" }}>
        <div>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827", display: "block" }}>
            Nhắc khẩn cấp khi chuỗi ngày học (Streak) sắp mất
          </span>
          <span style={{ fontSize: "12px", color: "#6b7280" }}>Cảnh báo khi chưa học bài trước giờ hết ngày</span>
        </div>
        <input
          type="checkbox"
          disabled={disabled}
          checked={settings.streakAtRiskReminderEnabled}
          onChange={(e) => onUpdate((prev) => ({ ...prev, streakAtRiskReminderEnabled: e.target.checked }))}
          style={{ width: "18px", height: "18px", accentColor: "#863bff" }}
        />
      </label>

      <div style={{ display: "flex", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="quietHoursStart" style={{ fontSize: "13px", fontWeight: 600, color: "#111827", display: "block", marginBottom: "4px" }}>
            Giờ yên lặng - Bắt đầu
          </label>
          <input
            id="quietHoursStart"
            type="time"
            disabled={disabled}
            value={settings.quietHoursStart}
            onChange={(e) => onUpdate((prev) => ({ ...prev, quietHoursStart: e.target.value }))}
            style={{ width: "100%", padding: "6px 10px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "13px" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="quietHoursEnd" style={{ fontSize: "13px", fontWeight: 600, color: "#111827", display: "block", marginBottom: "4px" }}>
            Giờ yên lặng - Kết thúc
          </label>
          <input
            id="quietHoursEnd"
            type="time"
            disabled={disabled}
            value={settings.quietHoursEnd}
            onChange={(e) => onUpdate((prev) => ({ ...prev, quietHoursEnd: e.target.value }))}
            style={{ width: "100%", padding: "6px 10px", borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "13px" }}
          />
        </div>
      </div>

      <QuietHoursHintBanner hint={hint} />
    </div>
  );
};

interface ReminderSettingsSectionProps {
  settings: ExtensionSettingsPayload;
  onUpdate: React.Dispatch<React.SetStateAction<ExtensionSettingsPayload | null>>;
}

export const ReminderSettingsSection: React.FC<ReminderSettingsSectionProps> = ({
  settings,
  onUpdate,
}) => {
  const updateSettings = (
    updater: (prev: ExtensionSettingsPayload) => ExtensionSettingsPayload,
  ) => {
    onUpdate((prev) => (prev ? updater(prev) : prev));
  };

  return (
    <div style={{ marginBottom: "32px" }}>
      <h2
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: "#111827",
          marginBottom: "14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Bell size={18} color="#863bff" />
        Nhắc học &amp; Huy hiệu
      </h2>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          backgroundColor: "#fbfbfb",
          borderRadius: "16px",
          border: "1px solid #e5e5e5",
          cursor: "pointer",
          marginBottom: "10px",
        }}
      >
        <div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
            Hiển thị số thẻ đến hạn trên icon tiện ích (Badge)
          </div>
          <div style={{ fontSize: "12.5px", color: "#6b7280", marginTop: "4px" }}>
            Cập nhật huy hiệu góc trên thanh công cụ mỗi 30 phút hoặc khi có thẻ đến hạn
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.badgeEnabled}
          onChange={(e) => updateSettings((s) => ({ ...s, badgeEnabled: e.target.checked }))}
          style={{ width: "18px", height: "18px", accentColor: "#863bff", cursor: "pointer" }}
        />
      </label>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          backgroundColor: "#fbfbfb",
          borderRadius: "16px",
          border: "1px solid #e5e5e5",
          cursor: "pointer",
        }}
      >
        <div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
            Bật thông báo nhắc học hằng ngày
          </div>
          <div style={{ fontSize: "12.5px", color: "#6b7280", marginTop: "4px" }}>
            Gửi thông báo trên trình duyệt nhắc bạn hoàn thành mục tiêu ngày
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.remindersEnabled}
          onChange={(e) => updateSettings((s) => ({ ...s, remindersEnabled: e.target.checked }))}
          style={{ width: "18px", height: "18px", accentColor: "#863bff", cursor: "pointer" }}
        />
      </label>

      <ReminderChildControls settings={settings} onUpdate={updateSettings} />
    </div>
  );
};

export const OptionsApp: React.FC = () => {
  const [settings, setSettings] = useState<ExtensionSettingsPayload | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    extensionStorage.getSettings().then(setSettings);
  }, []);

  const handleToggleAutoIcon = (enabled: boolean) => {
    if (!settings) return;
    setSettings({ ...settings, autoShowFloatingIcon: enabled });
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim() || !settings) return;
    const clean = newDomain.trim().toLowerCase().replace(/^https?:\/\//, "");
    if (!settings.blacklistedDomains.includes(clean)) {
      setSettings({ ...settings, blacklistedDomains: [...settings.blacklistedDomains, clean] });
      setNewDomain("");
    }
  };

  const handleRemoveDomain = (domain: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      blacklistedDomains: settings.blacklistedDomains.filter((d) => d !== domain),
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    const updated = await saveReminderSettings(settings);
    setSettings(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (!settings) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Đang tải cài đặt...</div>;
  }

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "24px",
        border: "1px solid #e5e5e5",
        padding: "32px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "20px",
          borderBottom: "1px solid #f3f4f6",
          marginBottom: "28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <svg width="32" height="32" viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
              fill="#863bff"
            />
          </svg>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, fontFamily: "Nunito, sans-serif", color: "#111827" }}>
              Cài đặt WordStreak Extension
            </h1>
            <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
              Tùy chỉnh hành vi tra cứu và lưu từ vựng trên trình duyệt
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Floating Icon Behavior */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={18} color="#863bff" />
          Kích hoạt trên Trang Web
        </h2>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
            backgroundColor: "#fbfbfb",
            borderRadius: "16px",
            border: "1px solid #e5e5e5",
            cursor: "pointer",
          }}
        >
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
              Tự động hiển thị Icon Ngọn lửa khi bôi đen từ
            </div>
            <div style={{ fontSize: "12.5px", color: "#6b7280", marginTop: "4px" }}>
              Khi bôi đen từ 1 đến 5 từ tiếng Anh, icon nổi sẽ xuất hiện cạnh con trỏ chuột.
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.autoShowFloatingIcon}
            onChange={(e) => handleToggleAutoIcon(e.target.checked)}
            style={{ width: "18px", height: "18px", accentColor: "#863bff", cursor: "pointer" }}
          />
        </label>
      </div>

      {/* Section 2: Shortcuts */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Keyboard size={18} color="#863bff" />
          Phím tắt Mặc định
        </h2>
        <div
          style={{
            padding: "16px",
            backgroundColor: "#fbfbfb",
            borderRadius: "16px",
            border: "1px solid #e5e5e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>Tra từ nhanh &amp; Lưu 1-Click</div>
            <div style={{ fontSize: "12.5px", color: "#6b7280", marginTop: "4px" }}>
              Bôi đen từ và bấm tổ hợp phím hoặc chuột phải để lưu.
            </div>
          </div>
          <span
            style={{
              padding: "4px 10px",
              backgroundColor: "#ffffff",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "12.5px",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            {settings.shortcutKey || "Alt + W"}
          </span>
        </div>
      </div>

      {/* Section 3: Blacklisted Domains */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Shield size={18} color="#863bff" />
          Trang web Loại trừ (Blacklist)
        </h2>
        <div
          style={{
            padding: "16px",
            backgroundColor: "#fbfbfb",
            borderRadius: "16px",
            border: "1px solid #e5e5e5",
          }}
        >
          <div style={{ fontSize: "12.5px", color: "#6b7280", marginBottom: "12px" }}>
            Không hiển thị icon nổi trên các trang web này (ví dụ: `mail.google.com`, `docs.google.com`):
          </div>
          <form onSubmit={handleAddDomain} style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <input
              type="text"
              placeholder="Nhập tên miền (ví dụ: facebook.com)..."
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              style={{ flex: 1, padding: "8px 12px", fontSize: "13px", border: "1px solid #e5e5e5", borderRadius: "10px", outline: "none" }}
            />
            <button
              type="submit"
              style={{ backgroundColor: "#000000", color: "#ffffff", border: "none", borderRadius: "10px", padding: "0 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            >
              Thêm
            </button>
          </form>

          {settings.blacklistedDomains.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {settings.blacklistedDomains.map((domain) => (
                <span
                  key={domain}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    color: "#374151",
                  }}
                >
                  {domain}
                  <button
                    onClick={() => handleRemoveDomain(domain)}
                    style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "14px", lineHeight: 1 }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Nhắc học & Huy hiệu */}
      <ReminderSettingsSection settings={settings} onUpdate={setSettings} />

      {/* Save Button */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px" }}>
        {isSaved && (
          <span
            role="status"
            aria-live="polite"
            style={{ fontSize: "13px", color: "#047857", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}
          >
            <Check size={16} /> Đã lưu cài đặt!
          </span>
        )}
        <button
          onClick={handleSave}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#000000",
            color: "#ffffff",
            border: "none",
            borderRadius: "9999px",
            padding: "10px 24px",
            fontSize: "13.5px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            transition: "opacity 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Save size={16} />
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};
