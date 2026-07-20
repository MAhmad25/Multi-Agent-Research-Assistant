import { AnimatePresence, arc, motion } from "motion/react";
import { useMemo } from "react";
import { ChatInput } from "@/components/chat/ChatInput";
import { SuggestionChips } from "@/components/chat/SuggestionChips";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/layout/Hero";
import { ResultsView } from "@/components/layout/ResultsView";
import { useResearch } from "@/hooks/useResearch";
import { cn } from "@/lib/utils";

function App() {
      const { state, start, stop, reset } = useResearch();
      const hasStarted = state.status !== "idle";
      const isStreaming = state.status === "streaming";
      const dockPath = useMemo(() => arc({ strength: 0.3 }), []);

      return (
            <div className="flex h-dvh flex-col overflow-hidden bg-background">
                  {hasStarted && <Header onNewResearch={reset} />}

                  <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
                        <AnimatePresence mode="wait">
                              {!hasStarted ? (
                                    <div key="hero-wrap" className="flex min-h-full items-center justify-center px-4">
                                          <Hero />
                                    </div>
                              ) : (
                                    <ResultsView key="results" state={state} />
                              )}
                        </AnimatePresence>
                  </div>

                  <motion.div layout transition={{ layout: { duration: 0.4, path: dockPath } }} className={cn("shrink-0 px-4", hasStarted ? " bg-background/90 py-4 backdrop-blur-sm" : "pb-12")}>
                        <div className="mx-auto w-full max-w-2xl">
                              <ChatInput onSubmit={start} onStop={stop} isStreaming={isStreaming} compact={hasStarted} />
                              {!hasStarted && (
                                    <div className="mt-4">
                                          <SuggestionChips onPick={start} />
                                    </div>
                              )}
                        </div>
                  </motion.div>
            </div>
      );
}

export default App;
