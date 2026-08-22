import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Target, Sparkles, Shield, Award, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "../../../common/components/Button";
import { useAuthStore } from "../../../store/useAuthStore";
import { UserAvatar } from "./UserAvatar";
import { ProfileGoalTab } from "./ProfileGoalTab";
import { AvatarTab } from "./AvatarTab";
import { SecurityTab } from "./SecurityTab";
import { LanguageSettingsTab } from "./LanguageSettingsTab";
import { XpHistoryDrawer } from "../../gamification/components/XpHistoryDrawer";

export type SettingsTab =
  "profile" | "avatar" | "security" | "gamification" | "language";

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
}

interface NavTabItem {
  id: SettingsTab;
  labelKey: string;
  defaultLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_TABS: NavTabItem[] = [
  {
    id: "profile",
    labelKey: "settings:tabs.profile",
    defaultLabel: "Profile & Goals",
    icon: Target,
  },
  {
    id: "avatar",
    labelKey: "settings:tabs.avatar",
    defaultLabel: "Avatar",
    icon: Sparkles,
  },
  {
    id: "security",
    labelKey: "settings:tabs.security",
    defaultLabel: "Security",
    icon: Shield,
  },
  {
    id: "gamification",
    labelKey: "settings:tabs.gamification",
    defaultLabel: "Level & XP",
    icon: Award,
  },
  {
    id: "language",
    labelKey: "settings:tabs.language",
    defaultLabel: "Language & Region",
    icon: Globe,
  },
];

const SettingsModalContent: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = "profile",
}) => {
  const { t } = useTranslation(["settings", "common"]);
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white border border-[#e5e5e5] shadow-2xl flex flex-col max-h-[85vh] my-auto text-black"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Fixed Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0] bg-[#fafafa] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#f3e8ff] text-[#7e22ce] flex items-center justify-center border border-[#e9d5ff] shrink-0">
                <UserAvatar
                  avatarUrl={user?.avatarUrl}
                  username={user?.username}
                  size="sm"
                  showBorder={false}
                />
              </div>
              <div>
                <h2
                  id="settings-modal-title"
                  className="text-base font-bold text-black tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t("settings:title", "Settings & Goals")}
                </h2>
                <p className="text-xs text-[#737373]">
                  {user?.username} • {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#737373] hover:text-black rounded-full hover:bg-black/5 transition-colors cursor-pointer"
              aria-label={t("common:actions.close", "Close")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#f0f0f0] bg-[#fafafa]/50 px-6 gap-2 pt-1.5 shrink-0 overflow-x-auto">
            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  data-testid={`settings-tab-${tab.id}`}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "border-[#9333ea] text-black"
                      : "border-transparent text-[#737373] hover:text-black"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t(tab.labelKey, tab.defaultLabel)}</span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Tab Body */}
          <div className="p-5 sm:p-6 overflow-y-auto min-h-0 flex-1 space-y-5 text-black text-sm">
            {activeTab === "profile" && <ProfileGoalTab />}
            {activeTab === "avatar" && <AvatarTab />}
            {activeTab === "security" && <SecurityTab />}
            {activeTab === "gamification" && <XpHistoryDrawer />}
            {activeTab === "language" && <LanguageSettingsTab />}
          </div>

          {/* Sticky Modal Action Footer */}
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#f0f0f0] bg-[#fafafa] shrink-0 rounded-b-3xl">
            <div className="text-xs text-[#737373] hidden sm:block">
              {activeTab === "profile" &&
                t(
                  "settings:profile.dailyGoalDesc",
                  "Update daily review goals",
                )}
              {activeTab === "avatar" &&
                t("settings:avatar.title", "Choose avatar")}
              {activeTab === "security" &&
                t("settings:security.password", "Account security password")}
              {activeTab === "gamification" &&
                t("settings:tabs.gamification", "Gamification & XP History")}
              {activeTab === "language" &&
                t("settings:language.title", "Language & Region")}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <Button type="button" variant="ghost" size="md" onClick={onClose}>
                {t("common:actions.close", "Close")}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
};

export const SettingsModal: React.FC<SettingsModalProps> = (props) => {
  const { user } = useAuthStore();
  if (!props.isOpen) return null;
  return (
    <SettingsModalContent
      key={`${user?.id || "guest"}-${props.isOpen}`}
      {...props}
    />
  );
};
