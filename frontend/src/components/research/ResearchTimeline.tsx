import { PhaseGroup } from "@/components/research/PhaseGroup";
import { PHASE_ORDER, type ResearchState } from "@/types/research";

interface ResearchTimelineProps {
  phases: ResearchState["phases"];
}

export function ResearchTimeline({ phases }: ResearchTimelineProps) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-1">
      {PHASE_ORDER.map((phase) => {
        const p = phases[phase];
        return (
          <PhaseGroup
            key={phase}
            phase={phase}
            status={p.status}
            rows={p.rows}
            startedAt={p.startedAt}
            endedAt={p.endedAt}
          />
        );
      })}
    </div>
  );
}
