import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Volume2, Sparkles, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PurpleStreakFlame } from "./PurpleStreakFlame";

const sampleWordsData: {
  [key: string]: { ipa: string; pos: string; def: string; example: string };
} = {
  serendipity: {
    ipa: "/ˌser.ənˈdɪp.ə.ti/",
    pos: "noun",
    def: "Discovering valuable or pleasant things by chance in a happy way.",
    example:
      "Discovering WordStreak was pure serendipity for my IELTS vocabulary.",
  },
  ubiquitous: {
    ipa: "/juːˈbɪk.wɪ.təs/",
    pos: "adj",
    def: "Present, appearing, or found everywhere simultaneously.",
    example:
      "Smartphones have made instant English dictionary lookups ubiquitous.",
  },
  resilience: {
    ipa: "/rɪˈzɪl.jəns/",
    pos: "noun",
    def: "The capacity to recover quickly from difficulties; toughness.",
    example: "Daily 5-minute study streaks build remarkable memory resilience.",
  },
  ephemeral: {
    ipa: "/ɪˈfem.ər.əl/",
    pos: "adj",
    def: "Lasting for a very short time; transitory; fleeting.",
    example:
      "Cramming before an exam creates ephemeral memory that vanishes quickly.",
  },
};

export function HeroSection() {
  const [selectedWord, setSelectedWord] = useState("serendipity");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const wordData = sampleWordsData[selectedWord] || sampleWordsData.serendipity;

  const handlePlayAudio = (wordToSpeak: string) => {
    setIsPlayingAudio(true);
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(wordToSpeak);
      utterance.rate = 0.88;
      utterance.lang = "en-US";
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 900);
    }
  };

  return (
    <section className="pt-24 pb-14 sm:pt-32 sm:pb-16 text-center overflow-hidden">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 flex flex-col items-center">
        {/* Burning Purple Streak Flame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4"
        >
          <PurpleStreakFlame size="lg" />
        </motion.div>

        {/* Streak Flame Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-[#fafafa] px-3.5 py-1 text-xs font-mono text-black shadow-xs"
        >
          <span className="h-2 w-2 rounded-full bg-[#9333ea] animate-ping" />
          <span>Keep your daily English streak burning · 100% Free</span>
        </motion.div>

        {/* Concise Display XL Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="display-xl max-w-xl mx-auto tracking-tight"
        >
          Master English vocabulary.
          <span className="block text-[#000000]">Never forget a word.</span>
        </motion.h1>

        {/* Punchy Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="body-md mt-3 max-w-lg mx-auto"
        >
          SM-2 spaced repetition, native audio IPA flashcards, and daily streak
          protection — built for learners who want permanent memory.
        </motion.p>

        {/* Compact Interactive Word Lookup Pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-6 w-full max-w-md"
        >
          <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3.5 text-left shadow-xs transition-colors hover:border-[#d4d4d4]">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2 mb-2.5">
              <span className="text-[11px] font-mono text-[#737373] uppercase tracking-wider">
                Instant Word Lookup
              </span>
              <div className="flex gap-1">
                {Object.keys(sampleWordsData).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setSelectedWord(w)}
                    className={`cursor-pointer rounded-full px-2 py-0.5 text-[11px] font-mono transition-all ${
                      selectedWord === w
                        ? "bg-black text-white"
                        : "bg-white text-[#737373] border border-[#e5e5e5] hover:text-black"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedWord}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-lg font-bold tracking-tight text-black"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {selectedWord}
                    </span>
                    <span className="text-xs text-[#737373] font-mono">
                      {wordData.ipa} ·{" "}
                      <span className="italic">{wordData.pos}</span>
                    </span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    type="button"
                    onClick={() => handlePlayAudio(selectedWord)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-black hover:border-black transition-colors cursor-pointer"
                    title="Play pronunciation"
                  >
                    {isPlayingAudio ? (
                      <div className="flex items-center gap-0.5 h-2.5">
                        <span className="w-0.5 h-2.5 bg-black rounded-full audio-bar-1" />
                        <span className="w-0.5 h-2.5 bg-black rounded-full audio-bar-2" />
                        <span className="w-0.5 h-2.5 bg-black rounded-full audio-bar-3" />
                      </div>
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
                    )}
                  </motion.button>
                </div>

                <p className="text-xs text-[#525252] leading-relaxed">
                  {wordData.def}
                </p>

                <div className="rounded-md border border-[#e5e5e5] bg-white p-2 text-[11px] text-[#737373] italic">
                  &ldquo;{wordData.example}&rdquo;
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* CTA Button Group */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link to="/register" className="btn-primary">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              <span>Start Learning Free</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              document
                .getElementById("interactive-demo")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="btn-secondary"
          >
            Try Interactive Sandbox ↓
          </motion.button>
        </motion.div>

        {/* Free Forever & Open Trust Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-[#a3a3a3]"
        >
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3 text-black" /> 100% Free Forever
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3 text-black" /> No Ads / Paywall
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3 text-black" /> Anki (.apkg) & CSV Export
          </span>
        </motion.div>
      </div>
    </section>
  );
}
