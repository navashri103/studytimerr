"use client";

import { motion } from "framer-motion";
import { TechniqueCard } from "@/components/TechniqueCard";
import { techniques } from "@/lib/techniques";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

export default function Home() {
  return (
    <main className="flex flex-1 flex-col px-6 py-12 sm:px-12 sm:py-16">
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-black/50">
        <span>StudyTimer</span>
        <span>Four Techniques</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mt-16 sm:mt-24"
      >
        <h1 className="font-[family-name:var(--font-display)] text-[14vw] font-bold uppercase leading-[0.85] tracking-tight text-[#14130f] sm:text-[8vw]">
          Focus Your
          <br />
          Time, Study
          <br />
          With Intent
        </h1>
      </motion.div>

      <div className="mt-10 flex items-center gap-4 text-black/40">
        <span className="h-px flex-1 border-t border-dashed border-black/20" />
        <p className="max-w-sm text-sm leading-relaxed text-black/55">
          Four time-management methods, each on its own page. Pick one, learn
          how it works, and use it to run your next study session.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-16 grid w-full grid-cols-1 gap-6 sm:mt-24 sm:grid-cols-2 lg:grid-cols-4"
      >
        {techniques.map((technique, i) => (
          <TechniqueCard
            key={technique.id}
            technique={technique}
            offset={i % 2 === 1}
          />
        ))}
      </motion.div>
    </main>
  );
}
