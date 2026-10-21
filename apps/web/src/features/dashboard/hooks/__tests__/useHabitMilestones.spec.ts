import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import {
  useHabitMilestones,
  getCelebratedMilestones,
  saveCelebratedMilestone,
} from "../useHabitMilestones";

describe("useHabitMilestones (US-LIB-16 / TC-LIB-16-004)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not trigger milestone when masteredCount < 50", () => {
    const { result } = renderHook(() => useHabitMilestones(30));
    expect(result.current.activeMilestone).toBeNull();
  });

  it("triggers 50-word milestone when masteredCount >= 50", () => {
    const { result } = renderHook(() => useHabitMilestones(55));
    expect(result.current.activeMilestone).toBeDefined();
    expect(result.current.activeMilestone?.id).toBe("words-50");
    expect(result.current.activeMilestone?.targetWords).toBe(50);

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.activeMilestone).toBeNull();
    expect(getCelebratedMilestones()).toContain("words-50");
  });

  it("does not re-trigger an already celebrated milestone", () => {
    saveCelebratedMilestone("words-50");

    const { result } = renderHook(() => useHabitMilestones(75));
    expect(result.current.activeMilestone).toBeNull();
  });

  it("triggers highest uncelebrated milestone when jumping ahead", () => {
    const { result } = renderHook(() => useHabitMilestones(350));
    expect(result.current.activeMilestone?.id).toBe("words-300");
  });
});
