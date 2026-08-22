import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  MessageSquare,
  Briefcase,
  BookOpen,
  Check,
  ArrowRight,
  Sparkles,
  Clock,
  Target,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface PathwayConfig {
  id: "ielts" | "conversation" | "business" | "polyglot";
  icon: React.ElementType;
  dailyTime: string;
  recommendedWords: string;
  retentionTarget: string;
  sampleTerms: string[];
}

const pathwayConfigs: PathwayConfig[] = [
  {
    id: "ielts",
    icon: GraduationCap,
    dailyTime: "10–15 mins/day",
    recommendedWords: "800+ Academic Words",
    retentionTarget: "98% Recall in 30 Days",
    sampleTerms: [
      "ubiquitous",
      "unprecedented",
      "dichotomy",
      "empirical",
      "substantiate",
    ],
  },
  {
    id: "conversation",
    icon: MessageSquare,
    dailyTime: "5–10 mins/day",
    recommendedWords: "1,200+ Everyday Terms",
    retentionTarget: "Instant Audio Recognition",
    sampleTerms: [
      "serendipity",
      "call it a day",
      "hit the nail",
      "resilience",
      "bite the bullet",
    ],
  },
  {
    id: "business",
    icon: Briefcase,
    dailyTime: "8–12 mins/day",
    recommendedWords: "500+ Corporate Words",
    retentionTarget: "Professional Precision",
    sampleTerms: [
      "leverage",
      "scalability",
      "mitigate",
      "synergy",
      "paradigm shift",
    ],
  },
  {
    id: "polyglot",
    icon: BookOpen,
    dailyTime: "Your own pace",
    recommendedWords: "Unlimited Custom Words",
    retentionTarget: "Open Anki Synchronization",
    sampleTerms: [
      "ephemeral",
      "juxtaposition",
      "quintessential",
      "melancholy",
      "petrichor",
    ],
  },
];

export function PricingSection() {
  const { t } = useTranslation("landing");
  const [activePathwayId, setActivePathwayId] = useState<string>("ielts");

  const pathways = useMemo(() => {
    return pathwayConfigs.map((cfg) => ({
      ...cfg,
      name: t(`pathways.${cfg.id}.name`, cfg.id),
      badge: t(`pathways.${cfg.id}.badge`, ""),
      headline: t(`pathways.${cfg.id}.headline`, ""),
      description: t(`pathways.${cfg.id}.desc`, ""),
      keyModules: [
        t(`pathways.${cfg.id}.m1`, ""),
        t(`pathways.${cfg.id}.m2`, ""),
        t(`pathways.${cfg.id}.m3`, ""),
        t(`pathways.${cfg.id}.m4`, ""),
      ],
    }));
  }, [t]);

  const currentPathway =
    pathways.find((p) => p.id === activePathwayId) || pathways[0];
  const PathIcon = currentPathway.icon;

  return (
    <section
      id="study-modes"
      className="landing-section border-t border-[#e5e5e5]"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="command-tag-chip mb-3">
            <Sparkles className="h-3.5 w-3.5 mr-1 text-black" />
            {t("pathways.tag", "Adaptive Learning Paths")}
          </span>
          <h2 className="display-lg">
            {t("pathways.title", "Built for every learning goal.")}
          </h2>
          <p className="body-md mt-2">
            {t(
              "pathways.subtitle",
              "Select your focus area — WordStreak automatically adapts the spaced repetition schedule and quiz modalities for your target.",
            )}
          </p>
        </motion.div>

        {/* Interactive Goal Pills Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {pathways.map((path) => {
            const Icon = path.icon;
            const isActive = activePathwayId === path.id;
            return (
              <motion.button
                key={path.id}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => setActivePathwayId(path.id)}
                className={`flex items-center gap-2 cursor-pointer rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? "bg-black text-white shadow-md shadow-black/10"
                    : "border border-[#e5e5e5] bg-[#fafafa] text-[#737373] hover:text-black hover:border-[#d4d4d4]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{path.name}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Dynamic Pathway Showcase Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPathway.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-[#e5e5e5] bg-[#ffffff] p-6 sm:p-8 shadow-xs"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Path Specs */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                    <PathIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-semibold text-[#737373] uppercase tracking-wider">
                      {currentPathway.badge}
                    </span>
                    <h3 className="heading-md text-black">
                      {currentPathway.name}
                    </h3>
                  </div>
                </div>

                <div>
                  <h4
                    className="text-base font-semibold text-black mb-1.5"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {currentPathway.headline}
                  </h4>
                  <p className="body-sm text-[#525252] leading-relaxed">
                    {currentPathway.description}
                  </p>
                </div>

                {/* Key Modules List */}
                <div className="space-y-2 pt-2 border-t border-[#e5e5e5]">
                  <p className="text-xs font-mono font-semibold text-black uppercase tracking-wider">
                    {t(
                      "pathways.curriculumLabel",
                      "Included Curriculum Modules:",
                    )}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentPathway.keyModules.map((mod, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-[#525252]"
                      >
                        <Check className="h-3.5 w-3.5 text-black shrink-0 mt-0.5" />
                        <span>{mod}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <Link to="/register" className="btn-primary">
                    <span>
                      {t("pathways.startPath", "Start This Learning Path")}
                    </span>
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                  <span className="text-xs font-mono text-[#737373]">
                    {t(
                      "pathways.noCreditCard",
                      "100% Free · No Credit Card Required",
                    )}
                  </span>
                </div>
              </div>

              {/* Right Column: Path Telemetry & Sample Vocabulary */}
              <div className="lg:col-span-5 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-5 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2.5">
                  <span className="font-semibold text-black">
                    {t("pathways.metricsTitle", "PATH METRICS")}
                  </span>
                  <span className="text-[11px] text-[#27c93f] font-bold">
                    {t("pathways.sm2Tuned", "SM-2 TUNED")}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#737373] flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />{" "}
                      {t("pathways.dailyCommitment", "Daily Commitment:")}
                    </span>
                    <span className="text-black font-semibold">
                      {currentPathway.dailyTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#737373] flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" />{" "}
                      {t("pathways.deckScope", "Deck Scope:")}
                    </span>
                    <span className="text-black font-semibold">
                      {currentPathway.recommendedWords}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#737373] flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5" />{" "}
                      {t("pathways.retentionTarget", "Retention Target:")}
                    </span>
                    <span className="text-black font-semibold">
                      {currentPathway.retentionTarget}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#e5e5e5]">
                  <p className="text-[11px] text-[#737373] uppercase tracking-wider mb-2">
                    {t(
                      "pathways.sampleWords",
                      "Sample Flashcard Words in Deck:",
                    )}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentPathway.sampleTerms.map((term) => (
                      <span
                        key={term}
                        className="rounded-md border border-[#e5e5e5] bg-white px-2 py-1 text-[11px] font-mono text-black"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
