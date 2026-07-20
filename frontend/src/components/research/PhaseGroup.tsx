import { useEffect, useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, Globe, Loader2, PenLine, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Phase, PhaseStatus, ToolRow } from "@/types/research";

type IconType = ComponentType<{ className?: string }>;

const PHASE_CONFIG: Record<
  Phase,
  {
    icon: IconType;
    activeLabel: string;
    doneLabel: string;
    idleLabel: string;
    noun: string;
    pluralNoun: string;
    emptyDescription: string;
  }
> = {
  search: {
    icon: Search,
    activeLabel: "Searching the web",
    doneLabel: "Searched the web",
    idleLabel: "Search the web",
    noun: "search",
    pluralNoun: "searches",
    emptyDescription: "Looking for relevant, trustworthy sources",
  },
  reader: {
    icon: Globe,
    activeLabel: "Reading sources",
    doneLabel: "Read sources",
    idleLabel: "Read sources",
    noun: "page",
    pluralNoun: "pages",
    emptyDescription: "Pulling facts and evidence out of each source",
  },
  critic: {
    icon: PenLine,
    activeLabel: "Writing the report",
    doneLabel: "Report ready",
    idleLabel: "Write the report",
    noun: "note",
    pluralNoun: "notes",
    emptyDescription: "Comparing evidence and drafting a structured report",
  },
};

function prettifyDetail(phase: Phase, detail: string): string {
  if (phase !== "reader") return detail;
  try {
    const url = new URL(detail);
    const path = url.pathname !== "/" ? url.pathname : "";
    return `${url.hostname.replace(/^www\./, "")}${path}`;
  } catch {
    return detail;
  }
}

function formatElapsed(startedAt: number, endedAt: number | null): string {
  const totalSeconds = Math.max(0, Math.round(((endedAt ?? Date.now()) - startedAt) / 1000));
  if (totalSeconds < 60) return `${totalSeconds}s`;
  return `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`;
}

function ToolRowView({ row, phase }: { row: ToolRow; phase: Phase }) {
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="flex items-center gap-2 py-1 text-sm"
    >
      <span
        className={cn(
          "h-1 w-1 shrink-0 rounded-full",
          row.status === "error"
            ? "bg-destructive"
            : row.status === "active"
              ? "bg-primary"
              : "bg-muted-foreground/50",
        )}
      />
      <span
        className={cn(
          "truncate",
          row.status === "active" && "shimmer-text",
          row.status === "error" && "text-destructive",
          row.status === "done" && "text-muted-foreground",
        )}
      >
        {prettifyDetail(phase, row.detail)}
      </span>
      {row.status === "active" && (
        <Loader2 className="h-3 w-3 shrink-0 animate-spin text-muted-foreground" />
      )}
    </motion.div>
  );
}

interface PhaseGroupProps {
  phase: Phase;
  status: PhaseStatus;
  rows: ToolRow[];
  startedAt: number | null;
  endedAt: number | null;
}

export function PhaseGroup({ phase, status, rows, startedAt, endedAt }: PhaseGroupProps) {
  const config = PHASE_CONFIG[phase];
  const Icon = config.icon;
  const [expanded, setExpanded] = useState(false);
  const [, forceTick] = useState(0);
  const wasPending = useRef(false);

  useEffect(() => {
    if (status === "pending" && !wasPending.current) setExpanded(true);
    wasPending.current = status === "pending";
  }, [status]);

  useEffect(() => {
    if (status !== "pending") return;
    const id = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  if (status === "idle") {
    return (
      <div className="flex items-center gap-2.5 py-2 text-sm text-muted-foreground/50">
        <Icon className="h-4 w-4" />
        <span>{config.idleLabel}</span>
      </div>
    );
  }

  const isPending = status === "pending";
  const hasRows = rows.length > 0;
  const countLabel = hasRows
    ? `${rows.length} ${rows.length === 1 ? config.noun : config.pluralNoun}`
    : null;
  const elapsedLabel = startedAt ? formatElapsed(startedAt, endedAt) : null;

  return (
    <div className="border-b border-border/70 py-0.5 last:border-b-0">
      <button
        type="button"
        onClick={() => hasRows && setExpanded((v) => !v)}
        disabled={!hasRows}
        className="flex w-full items-center gap-2.5 py-2 text-left"
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            isPending ? "text-primary" : "text-foreground",
          )}
        />
        <span className={cn("shrink-0 text-sm", isPending ? "shimmer-text" : "text-foreground")}>
          {isPending ? config.activeLabel : config.doneLabel}
        </span>
        {countLabel ? (
          <span className="truncate text-sm text-muted-foreground">{countLabel}</span>
        ) : (
          !isPending && (
            <span className="truncate text-sm text-muted-foreground">
              {config.emptyDescription}
            </span>
          )
        )}
        <span className="flex-1" />
        {elapsedLabel && (
          <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground/70">
            {elapsedLabel}
          </span>
        )}
        {hasRows && (
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
              expanded && "rotate-90",
            )}
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && hasRows && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-0.5 py-1 pb-2.5 pl-[26px]">
              <AnimatePresence initial={false}>
                {rows.map((row) => (
                  <ToolRowView key={row.id} row={row} phase={phase} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
