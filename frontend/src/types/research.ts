export type Phase = "search" | "reader" | "critic";

export type ResearchEvent =
  | { type: "phase_start"; phase: Phase }
  | { type: "tool_call"; phase: Phase; call_id: string; tool: string; detail: string }
  | { type: "tool_result"; phase: Phase; call_id: string }
  | { type: "tool_error"; phase: Phase; call_id: string; message: string }
  | { type: "phase_end"; phase: Phase }
  | { type: "final"; report: string }
  | { type: "error"; message: string }
  | { type: "done" }
  | { type: "heartbeat" };

export type RowStatus = "active" | "done" | "error";

export interface ToolRow {
  id: string;
  tool: string;
  detail: string;
  status: RowStatus;
}

export type PhaseStatus = "idle" | "pending" | "completed";

export interface PhaseState {
  status: PhaseStatus;
  rows: ToolRow[];
  startedAt: number | null;
  endedAt: number | null;
}

export type RunStatus = "idle" | "streaming" | "done" | "error" | "stopped";

export interface ResearchState {
  status: RunStatus;
  query: string;
  phases: Record<Phase, PhaseState>;
  report: string | null;
  errorMessage: string | null;
}

export const PHASE_ORDER: Phase[] = ["search", "reader", "critic"];

export function createInitialPhaseState(): PhaseState {
  return { status: "idle", rows: [], startedAt: null, endedAt: null };
}

export function createInitialResearchState(): ResearchState {
  return {
    status: "idle",
    query: "",
    phases: {
      search: createInitialPhaseState(),
      reader: createInitialPhaseState(),
      critic: createInitialPhaseState(),
    },
    report: null,
    errorMessage: null,
  };
}
