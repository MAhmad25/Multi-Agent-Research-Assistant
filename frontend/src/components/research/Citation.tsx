import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CitationSource {
      url: string;
      title: string;
      description?: string;
}

function hostname(url: string) {
      try {
            return new URL(url).hostname.replace(/^www\./, "");
      } catch {
            return url;
      }
}

function faviconUrl(url: string) {
      return `https://www.google.com/s2/favicons?sz=64&domain=${hostname(url)}`;
}

interface CitationCtx {
      citations: CitationSource[];
      open: boolean;
      setOpen: (open: boolean) => void;
}

const CitationContext = createContext<CitationCtx | null>(null);

function useCitationContext() {
      const ctx = useContext(CitationContext);
      if (!ctx) throw new Error("Citation components must be used inside <Citation>");
      return ctx;
}

export function Citation({ citations, children }: { citations: CitationSource[]; children: ReactNode }) {
      const [open, setOpen] = useState(false);
      const rootRef = useRef<HTMLSpanElement>(null);

      useEffect(() => {
            if (!open) return;
            const onPointerDown = (e: PointerEvent) => {
                  if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
            };
            const onKeyDown = (e: KeyboardEvent) => {
                  if (e.key === "Escape") setOpen(false);
            };
            document.addEventListener("pointerdown", onPointerDown);
            document.addEventListener("keydown", onKeyDown);
            return () => {
                  document.removeEventListener("pointerdown", onPointerDown);
                  document.removeEventListener("keydown", onKeyDown);
            };
      }, [open]);

      if (citations.length === 0) return null;

      return (
            <CitationContext.Provider value={{ citations, open, setOpen }}>
                  <span ref={rootRef} className="relative inline-flex align-baseline">
                        {children}
                  </span>
            </CitationContext.Provider>
      );
}

export function CitationTrigger() {
      const { citations, open, setOpen } = useCitationContext();
      const shown = citations.slice(0, 3);

      return (
            <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className={cn("relative mx-0.5 inline-flex -translate-y-[3px] items-center gap-1 rounded-full border border-border bg-secondary py-0.5 pl-0.5 pr-1.5 align-baseline text-[10px] font-medium text-muted-foreground transition-colors", "hover:bg-accent hover:text-accent-foreground", open && "bg-accent text-accent-foreground")}>
                  <span className="flex items-center">
                        {shown.map((source, i) => (
                              <img
                                    key={source.url}
                                    src={faviconUrl(source.url)}
                                    alt=""
                                    className="h-3 w-3 rounded-full border border-card bg-card object-cover"
                                    style={{ marginLeft: i === 0 ? 0 : -4 }}
                                    onError={(e) => {
                                          e.currentTarget.style.display = "none";
                                    }}
                              />
                        ))}
                  </span>
                  {citations.length}
            </button>
      );
}

export function CitationContent({ children }: { children: ReactNode }) {
      const { open } = useCitationContext();

      return (
            <AnimatePresence>
                  {open && (
                        <motion.div initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.97 }} transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }} className="not-prose absolute left-0 top-full z-30 mt-2 w-[19rem] max-w-[85vw] overflow-hidden rounded-xl border border-border bg-popover text-left shadow-lg">
                              {children}
                        </motion.div>
                  )}
            </AnimatePresence>
      );
}

interface CarouselCtx {
      index: number;
      setIndex: (i: number) => void;
      total: number;
}

const CarouselContext = createContext<CarouselCtx | null>(null);

function useCarouselContext() {
      const ctx = useContext(CarouselContext);
      if (!ctx) throw new Error("CitationCarousel* components must be used inside <CitationCarousel>");
      return ctx;
}

export function CitationCarousel({ children }: { children: ReactNode }) {
      const { citations } = useCitationContext();
      const [index, setIndex] = useState(0);

      return <CarouselContext.Provider value={{ index, setIndex, total: citations.length }}>{children}</CarouselContext.Provider>;
}

export function CitationCarouselHeader({ children }: { children: ReactNode }) {
      return <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">{children}</div>;
}

export function CitationSourcesBadge() {
      const { total } = useCarouselContext();
      return (
            <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                  {total} {total === 1 ? "Source" : "Sources"}
            </span>
      );
}

export function CitationCarouselPagination({ children }: { children: ReactNode }) {
      const { total } = useCarouselContext();
      if (total <= 1) return null;
      return <div className="flex items-center gap-0.5">{children}</div>;
}

export function CitationCarouselPrev() {
      const { index, setIndex } = useCarouselContext();
      return (
            <button type="button" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0} aria-label="Previous source" className="flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-30">
                  <ChevronLeft className="h-3 w-3" />
            </button>
      );
}

export function CitationCarouselNext() {
      const { index, setIndex, total } = useCarouselContext();
      return (
            <button type="button" onClick={() => setIndex(Math.min(total - 1, index + 1))} disabled={index === total - 1} aria-label="Next source" className="flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-30">
                  <ChevronRight className="h-3 w-3" />
            </button>
      );
}

export function CitationCarouselIndex() {
      const { index, total } = useCarouselContext();
      return (
            <span className="min-w-[2.4rem] text-center font-mono text-[10px] tabular-nums text-muted-foreground">
                  {index + 1} / {total}
            </span>
      );
}

export function CitationCarouselContent({ children }: { children: ReactNode }) {
      const { index } = useCarouselContext();
      return (
            <div className="overflow-hidden">
                  <div className="flex transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ transform: `translateX(-${index * 100}%)` }}>
                        {children}
                  </div>
            </div>
      );
}

export function CitationCarouselItem({ index, children }: { index: number; children: ReactNode }) {
      const { citations } = useCitationContext();
      const source = citations[index];
      if (!source) return null;
      return (
            <div className="w-full shrink-0">
                  <SourceContext.Provider value={source}>{children}</SourceContext.Provider>
            </div>
      );
}

const SourceContext = createContext<CitationSource | null>(null);

export function CitationItem() {
      const source = useContext(SourceContext);
      if (!source) return null;

      return (
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="block px-3 py-2.5 transition-colors hover:bg-accent">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <img
                              src={faviconUrl(source.url)}
                              alt=""
                              className="h-3.5 w-3.5 rounded-sm"
                              onError={(e) => {
                                    e.currentTarget.style.display = "none";
                              }}
                        />
                        <span className="truncate">{hostname(source.url)}</span>
                        <Link2 className="ml-auto h-3 w-3 shrink-0 opacity-50" />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm font-medium text-popover-foreground">{source.title || hostname(source.url)}</p>
                  {source.description && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{source.description}</p>}
            </a>
      );
}
