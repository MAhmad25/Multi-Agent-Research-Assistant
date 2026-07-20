import { motion } from "motion/react";
import { DiaTextReveal } from "@/components/chat/DiaText";

export function Hero() {
      return (
            <motion.div key="hero" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center text-center">
                  <img src="/favicon.svg" className="h-11 object-cover w-11" />
                  <div className="flex  items-center justify-center p-2">
                        <DiaTextReveal className="text-4xl font-bold tracking-tight" text="Reasearch Assistant" colors={["#A97CF8", "#F38CB8", "#FDCC92", "#A97CF8", "#F38CB8", "#FDCC92"]} />
                  </div>
                  <p className="max-w-md text-[15px] text-muted-foreground">What should we research today?</p>
            </motion.div>
      );
}
