import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderToString } from "react-dom/server";
import {
  getQuietHoursHint,
  ReminderSettingsSection,
  saveReminderSettings,
} from "./OptionsApp";
import { extensionStorage } from "../shared/storage";
import { DEFAULT_SETTINGS } from "../shared/constants";
import type { ExtensionSettingsPayload } from "@wordstreak/shared-types";

describe("OptionsApp & Reminder Settings UI (TC-ERS-011 .. TC-ERS-016)", () => {
  const sampleSettings: ExtensionSettingsPayload = {
    ...DEFAULT_SETTINGS,
    badgeEnabled: true,
    remindersEnabled: true,
    dailyReminderTime: "20:00",
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
    streakAtRiskReminderEnabled: true,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("TC-ERS-011: renders Nhắc học & Huy hiệu section with all 6 controls populated", () => {
    const html = renderToString(
      <ReminderSettingsSection
        settings={sampleSettings}
        onUpdate={() => {}}
      />,
    );

    expect(html).toContain("Nhắc học &amp; Huy hiệu");
    expect(html).toContain("Hiển thị số thẻ đến hạn trên icon tiện ích (Badge)");
    expect(html).toContain("Bật thông báo nhắc học hằng ngày");
    expect(html).toContain("Giờ nhắc học cố định");
    expect(html).toContain('value="20:00"');
    expect(html).toContain("Nhắc khẩn cấp khi chuỗi ngày học (Streak) sắp mất");
    expect(html).toContain("Giờ yên lặng - Bắt đầu");
    expect(html).toContain('value="22:00"');
    expect(html).toContain("Giờ yên lặng - Kết thúc");
    expect(html).toContain('value="07:00"');
  });

  it("TC-ERS-012: disables child reminder controls when remindersEnabled is false while preserving values", () => {
    const disabledSettings: ExtensionSettingsPayload = {
      ...sampleSettings,
      remindersEnabled: false,
      dailyReminderTime: "19:30",
      quietHoursStart: "23:00",
      quietHoursEnd: "06:30",
      streakAtRiskReminderEnabled: false,
    };

    const html = renderToString(
      <ReminderSettingsSection
        settings={disabledSettings}
        onUpdate={() => {}}
      />,
    );

    // Master toggle is present
    expect(html).toContain("Bật thông báo nhắc học hằng ngày");

    // Values are preserved in inputs
    expect(html).toContain('value="19:30"');
    expect(html).toContain('value="23:00"');
    expect(html).toContain('value="06:30"');

    // Inputs have disabled attribute
    expect(html).toContain("disabled");
  });

  it("TC-ERS-013: detects overnight and same-day Quiet Hours overlap and renders warning banner", () => {
    // Overnight overlap (22:00 - 07:00, reminder at 23:30 or 06:15)
    const hint1 = getQuietHoursHint({
      remindersEnabled: true,
      dailyReminderTime: "23:30",
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00",
    });
    expect(hint1).toEqual({
      type: "overlap",
      message: "Giờ nhắc học hằng ngày đang nằm trong khung Giờ yên lặng - thông báo sẽ bị tạm ẩn vào thời điểm này.",
    });

    const hint2 = getQuietHoursHint({
      remindersEnabled: true,
      dailyReminderTime: "06:15",
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00",
    });
    expect(hint2).toEqual({
      type: "overlap",
      message: "Giờ nhắc học hằng ngày đang nằm trong khung Giờ yên lặng - thông báo sẽ bị tạm ẩn vào thời điểm này.",
    });

    // Same-day overlap (09:00 - 17:00, reminder at 12:00)
    const hint3 = getQuietHoursHint({
      remindersEnabled: true,
      dailyReminderTime: "12:00",
      quietHoursStart: "09:00",
      quietHoursEnd: "17:00",
    });
    expect(hint3).toEqual({
      type: "overlap",
      message: "Giờ nhắc học hằng ngày đang nằm trong khung Giờ yên lặng - thông báo sẽ bị tạm ẩn vào thời điểm này.",
    });

    // Renders banner in HTML
    const html = renderToString(
      <ReminderSettingsSection
        settings={{ ...sampleSettings, dailyReminderTime: "23:30" }}
        onUpdate={() => {}}
      />,
    );
    expect(html).toContain('role="status"');
    expect(html).toContain("Giờ nhắc học hằng ngày đang nằm trong khung Giờ yên lặng");
  });

  it("TC-ERS-014: verifies half-open boundary: quietHoursEnd has no warning, quietHoursStart has warning", () => {
    // Boundary at quietHoursEnd (07:00) -> half-open [start, end), so not overlapping
    const hintEnd = getQuietHoursHint({
      remindersEnabled: true,
      dailyReminderTime: "07:00",
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00",
    });
    expect(hintEnd).toBeNull();

    // Boundary at quietHoursStart (22:00) -> included, so overlapping
    const hintStart = getQuietHoursHint({
      remindersEnabled: true,
      dailyReminderTime: "22:00",
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00",
    });
    expect(hintStart).toEqual({
      type: "overlap",
      message: "Giờ nhắc học hằng ngày đang nằm trong khung Giờ yên lặng - thông báo sẽ bị tạm ẩn vào thời điểm này.",
    });
  });

  it("TC-ERS-015: renders non-blocking hint that Quiet Hours are disabled when start equals end", () => {
    const hintDisabled = getQuietHoursHint({
      remindersEnabled: true,
      dailyReminderTime: "20:00",
      quietHoursStart: "22:00",
      quietHoursEnd: "22:00",
    });
    expect(hintDisabled).toEqual({
      type: "disabled",
      message: "Giờ yên lặng đang tắt vì giờ bắt đầu trùng giờ kết thúc.",
    });

    const html = renderToString(
      <ReminderSettingsSection
        settings={{
          ...sampleSettings,
          quietHoursStart: "22:00",
          quietHoursEnd: "22:00",
        }}
        onUpdate={() => {}}
      />,
    );
    expect(html).toContain("Giờ yên lặng đang tắt vì giờ bắt đầu trùng giờ kết thúc.");
  });

  it("TC-ERS-016: saveReminderSettings persists to storage and dispatches UPDATE_SETTINGS even with overlap warning", async () => {
    (globalThis as any).chrome = {
      runtime: {
        sendMessage: vi.fn().mockResolvedValue({ success: true }),
      },
    };

    const overlappingSettings: ExtensionSettingsPayload = {
      ...sampleSettings,
      dailyReminderTime: "23:00",
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00",
    };

    const updateStorageSpy = vi
      .spyOn(extensionStorage, "updateSettings")
      .mockResolvedValue(overlappingSettings);

    const result = await saveReminderSettings(overlappingSettings);

    expect(updateStorageSpy).toHaveBeenCalledWith(overlappingSettings);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: "UPDATE_SETTINGS",
      payload: overlappingSettings,
    });
    expect(result).toEqual(overlappingSettings);
  });
});
