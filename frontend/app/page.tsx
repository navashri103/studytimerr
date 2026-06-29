"use client";

import { motion } from "framer-motion";
import { TechniqueCard } from "@/components/TechniqueCard";
import { techniques } from "@/lib/techniques";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center overflow-hidden px-6 py-20 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(251,146,60,0.12), transparent 45%), radial-gradient(circle at 80% 15%, rgba(34,211,238,0.1), transparent 45%), radial-gradient(circle at 50% 90%, rgba(167,139,250,0.1), transparent 50%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex max-w-2xl flex-col items-center gap-4 text-center"
      >
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
          StudyTimer
        </h1>
        <p className="text-base text-zinc-400 sm:text-lg">
          Four time-management techniques. Pick one, learn it, and put it to
          work.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-16 grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2"
      >
        {techniques.map((technique) => (
          <TechniqueCard key={technique.id} technique={technique} />
        ))}
      </motion.div>
    </main>
  );
}
