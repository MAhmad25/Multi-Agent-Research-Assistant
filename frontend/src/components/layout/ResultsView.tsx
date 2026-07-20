import { arc, motion } from "motion/react";
import { AlertCircle, OctagonPause } from "lucide-react";
import { ResearchTimeline } from "@/components/research/ResearchTimeline";
import { ReportView } from "@/components/research/ReportView";
import type { ResearchState } from "@/types/research";

interface ResultsViewProps {
  state: ResearchState;
}

export function ResultsView({ state }: ResultsViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 pb-10 pt-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, x: -16, y: 26 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        transition={{ duration: 0.45, path: arc({ strength: 0.5, direction: "ccw" }) }}
        className="self-end rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[15px] text-primary-foreground shadow-sm"
      >
        {state.query}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <ResearchTimeline phases={state.phases} />
      </motion.div>

      {state.status === "error" && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">The research run failed.</p>
            <p className="mt-0.5 text-destructive/80">
              {state.errorMessage ?? "An unknown error occurred."}
            </p>
          </div>
        </div>
      )}

      {state.status === "stopped" && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
          <OctagonPause className="h-4 w-4 shrink-0" />
          <p>Stopped before finishing. Send another question to start a new run.</p>
        </div>
      )}

      {state.report && <ReportView report={state.report} />}
    </div>
  );
}
