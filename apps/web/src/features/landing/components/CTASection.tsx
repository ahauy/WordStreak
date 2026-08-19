import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="landing-section">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-xl border border-[#262626] bg-[#171717] px-6 py-12 sm:px-12 sm:py-16 text-center text-white shadow-sm"
        >
          <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-mono text-white">
            <Flame className="h-3.5 w-3.5 fill-white text-white" />
            <span>100% Free Forever</span>
          </div>

          <h2
            className="text-2xl sm:text-3xl font-bold tracking-tight max-w-lg mx-auto"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ready to remember English words permanently?
          </h2>

          <p className="mt-3 text-sm sm:text-base text-white/70 max-w-md mx-auto leading-relaxed">
            Join language learners who turn just 5 minutes a day into an
            unstoppable vocabulary habit. Completely free to start.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register" className="btn-pill-on-dark">
                <span>Create Free Account</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/login"
                className="inline-flex items-center justify-center h-9 px-5 rounded-full border border-white/20 text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                Sign In to Account
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
