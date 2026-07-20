import { useCallback, useEffect, useReducer, useRef } from "react";
import { streamResearch } from "@/lib/research-stream";
import { createInitialResearchState, type Phase, type ResearchEvent, type ResearchState } from "@/types/research";

type Action = { kind: "start"; query: string } | { kind: "event"; event: ResearchEvent } | { kind: "fatal_error"; message: string } | { kind: "stop" } | { kind: "reset" };

function updatePhase(state: ResearchState, phase: Phase, updater: (p: ResearchState["phases"][Phase]) => ResearchState["phases"][Phase]): ResearchState {
      return {
            ...state,
            phases: { ...state.phases, [phase]: updater(state.phases[phase]) },
      };
}

function reducer(state: ResearchState, action: Action): ResearchState {
      switch (action.kind) {
            case "start":
                  return { ...createInitialResearchState(), status: "streaming", query: action.query };

            case "stop":
                  return state.status === "streaming" ? { ...state, status: "stopped" } : state;

            case "reset":
                  return createInitialResearchState();

            case "fatal_error":
                  return { ...state, status: "error", errorMessage: action.message };

            case "event": {
                  const event = action.event;
                  switch (event.type) {
                        case "phase_start":
                              return updatePhase(state, event.phase, (p) => ({
                                    ...p,
                                    status: "pending",
                                    startedAt: Date.now(),
                              }));

                        case "tool_call":
                              return updatePhase(state, event.phase, (p) => ({
                                    ...p,
                                    rows: [...p.rows, { id: event.call_id, tool: event.tool, detail: event.detail, status: "active" }],
                              }));

                        case "tool_result":
                              return updatePhase(state, event.phase, (p) => ({
                                    ...p,
                                    rows: p.rows.map((r) => (r.id === event.call_id ? { ...r, status: "done" } : r)),
                              }));

                        case "tool_error":
                              return updatePhase(state, event.phase, (p) => ({
                                    ...p,
                                    rows: p.rows.map((r) => (r.id === event.call_id ? { ...r, status: "error" } : r)),
                              }));

                        case "phase_end":
                              return updatePhase(state, event.phase, (p) => ({
                                    ...p,
                                    status: "completed",
                                    endedAt: Date.now(),
                              }));

                        case "final":
                              return { ...state, report: event.report, status: "done" };

                        case "error":
                              return { ...state, status: "error", errorMessage: event.message };

                        case "done":
                        case "heartbeat":
                        default:
                              return state;
                  }
            }

            default:
                  return state;
      }
}

export function useResearch() {
      const [state, dispatch] = useReducer(reducer, undefined, createInitialResearchState);
      const abortRef = useRef<AbortController | null>(null);

      const start = useCallback((query: string) => {
            const trimmed = query.trim();
            if (!trimmed) return;

            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            dispatch({ kind: "start", query: trimmed });

            streamResearch(trimmed, (event) => dispatch({ kind: "event", event }), controller.signal).catch((err: unknown) => {
                  if (controller.signal.aborted) return;
                  const message = err instanceof Error ? err.message : "Something went wrong.";
                  dispatch({ kind: "fatal_error", message });
            });
      }, []);

      const stop = useCallback(() => {
            abortRef.current?.abort();
            dispatch({ kind: "stop" });
      }, []);

      const reset = useCallback(() => {
            abortRef.current?.abort();
            dispatch({ kind: "reset" });
      }, []);

      useEffect(() => {
            return () => abortRef.current?.abort();
      }, []);

      return { state, start, stop, reset };
}
