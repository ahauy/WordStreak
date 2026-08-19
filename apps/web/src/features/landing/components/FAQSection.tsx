import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Is WordStreak completely free to use?",
    answer:
      "Yes! WordStreak is 100% free for all learners. There are no paid subscriptions, no paywalled features, and no credit card required. You get full access to the SM-2 algorithm, unlimited flashcards, AI lookup, and streak tracking.",
  },
  {
    question: "How does the SM-2 Spaced Repetition algorithm work?",
    answer:
      "SM-2 calculates optimal review intervals based on how easily you recall each word. Words rated 'Easy' get scheduled further into the future (+7 to +30 days), while words rated 'Hard' are reviewed sooner (+1 to +3 days) to reinforce memory pathways right before you forget them.",
  },
  {
    question: "Can I import my existing vocabulary decks from Anki or Quizlet?",
    answer:
      "Yes. WordStreak supports importing CSV, JSON, and standard Anki deck files (.apkg). Our AI parser automatically maps terms, phonetic spellings, definitions, and contextual examples into your new decks.",
  },
  {
    question: "How do streak freezes work?",
    answer:
      "Streak freezes automatically protect your daily streak when life gets busy. Every account receives streak freeze protection. If you miss a day, the freeze activates seamlessly without breaking your habit loop.",
  },
  {
    question: "Is WordStreak available offline?",
    answer:
      "Yes. WordStreak uses a local-first caching architecture. You can review flashcards, practice quizzes, and learn new words offline. Everything syncs to the cloud the next time you connect to the internet.",
  },
];

export function FAQSection() {
  const [openIndices, setOpenIndices] = useState<number[]>([0, 1]);

  const toggleFAQ = (idx: number) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  return (
    <section id="faq" className="landing-section border-t border-[#e5e5e5]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-xl mx-auto mb-12"
        >
          <span className="command-tag-chip mb-3">Questions</span>
          <h2 className="display-lg">Frequently asked questions.</h2>
          <p className="body-md mt-2">
            Everything you need to know about spaced repetition, streaks, and
            WordStreak.
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="divide-y divide-[#e5e5e5] border-t border-b border-[#e5e5e5]">
          {faqs.map((faq, idx) => {
            const isOpen = openIndices.includes(idx);
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="py-5"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="flex w-full items-center justify-between text-left cursor-pointer group"
                >
                  <h3 className="heading-sm text-black group-hover:opacity-80 transition-opacity pr-4">
                    {faq.question}
                  </h3>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] text-black shrink-0 transition-transform">
                    {isOpen ? (
                      <Minus className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 pr-8">
                        <p className="body-md text-[#737373] leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
