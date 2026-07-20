import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
      onSubmit: (query: string) => void;
      onStop?: () => void;
      isStreaming: boolean;
      compact?: boolean;
}

const MIRRORED_PROPS = ["boxSizing", "width", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "tabSize"] as const;

export function ChatInput({ onSubmit, onStop, isStreaming, compact = false }: ChatInputProps) {
      const [value, setValue] = useState("");
      const [justSubmitted, setJustSubmitted] = useState(false);
      const textareaRef = useRef<HTMLTextAreaElement>(null);
      const mirrorRef = useRef<HTMLDivElement>(null);
      const markerRef = useRef<HTMLSpanElement>(null);

      const caretX = useMotionValue(0);
      const caretY = useMotionValue(0);
      const caretOpacity = useMotionValue(0);
      const prefersReducedMotion = useReducedMotion();

      const springConfig = prefersReducedMotion ? { stiffness: 10000, damping: 100, mass: 0.1 } : { stiffness: 480, damping: 32, mass: 0.5 };
      const springX = useSpring(caretX, springConfig);
      const springY = useSpring(caretY, springConfig);

      // Model picker + attachment state — new UI additions, kept local/cosmetic.
      const [modelMenuOpen, setModelMenuOpen] = useState(false);
      const modelMenuRef = useRef<HTMLDivElement>(null);

      // Auto-resize the textarea as content grows, capped at a sane max height.
      useEffect(() => {
            const el = textareaRef.current;
            if (!el) return;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, compact ? 128 : 240)}px`;
      }, [value, compact]);

      const syncMirror = () => {
            const textarea = textareaRef.current;
            const mirror = mirrorRef.current;
            if (!textarea || !mirror) return;
            const styles = window.getComputedStyle(textarea);
            for (const prop of MIRRORED_PROPS) {
                  mirror.style[prop as never] = styles[prop as never];
            }
            mirror.style.whiteSpace = "pre-wrap";
            mirror.style.wordBreak = "break-word";
      };

      const updateCaret = () => {
            const textarea = textareaRef.current;
            const mirror = mirrorRef.current;
            const marker = markerRef.current;
            if (!textarea || !mirror || !marker) return;

            const start = textarea.selectionStart ?? 0;
            const end = textarea.selectionEnd ?? 0;
            const hasSelection = start !== end;
            const caretIndex = textarea.selectionDirection === "backward" ? start : end;

            syncMirror();
            mirror.textContent = textarea.value.slice(0, caretIndex);
            marker.textContent = "\u200b";
            mirror.appendChild(marker);

            const mirrorRect = mirror.getBoundingClientRect();
            const markerRect = marker.getBoundingClientRect();
            const x = markerRect.left - mirrorRect.left - textarea.scrollLeft;
            const y = markerRect.top - mirrorRect.top - textarea.scrollTop;

            caretX.set(x);
            caretY.set(y);

            const visible = x >= -2 && x <= textarea.clientWidth && y >= -2 && y <= textarea.clientHeight;
            caretOpacity.set(!hasSelection && visible ? 1 : 0);
      };

      const updateCaretRef = useRef(updateCaret);
      updateCaretRef.current = updateCaret;

      useEffect(() => {
            const textarea = textareaRef.current;
            if (textarea && document.activeElement === textarea) updateCaretRef.current();
      }, [value]);

      useEffect(() => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const updateIfFocused = () => {
                  if (document.activeElement === textarea) updateCaretRef.current();
            };
            const onSelectionChange = () => {
                  if (document.activeElement !== textarea) return;
                  requestAnimationFrame(updateIfFocused);
            };

            document.addEventListener("selectionchange", onSelectionChange);
            textarea.addEventListener("scroll", updateIfFocused);
            const resizeObserver = new ResizeObserver(updateIfFocused);
            resizeObserver.observe(textarea);
            void document.fonts?.ready.then(updateIfFocused);

            return () => {
                  document.removeEventListener("selectionchange", onSelectionChange);
                  textarea.removeEventListener("scroll", updateIfFocused);
                  resizeObserver.disconnect();
            };
      }, []);

      // Close the model menu on outside click / Escape.
      useEffect(() => {
            if (!modelMenuOpen) return;
            const onPointerDown = (e: PointerEvent) => {
                  if (modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) {
                        setModelMenuOpen(false);
                  }
            };
            const onKeyDown = (e: globalThis.KeyboardEvent) => {
                  if (e.key === "Escape") setModelMenuOpen(false);
            };
            document.addEventListener("pointerdown", onPointerDown);
            document.addEventListener("keydown", onKeyDown);
            return () => {
                  document.removeEventListener("pointerdown", onPointerDown);
                  document.removeEventListener("keydown", onKeyDown);
            };
      }, [modelMenuOpen]);

      const handleSubmit = () => {
            if (isStreaming || !value.trim()) return;
            onSubmit(value);
            setValue("");
            caretOpacity.set(0);
            if (textareaRef.current) textareaRef.current.style.height = "auto";
            setJustSubmitted(true);
            window.setTimeout(() => setJustSubmitted(false), 220);
      };

      const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
            }
      };

      const hasContent = value.trim().length > 0;

      return (
            <div className={cn("w-full rounded-3xl border border-border bg-secondary/60 p-1.5 transition-all duration-200", justSubmitted && "scale-[0.985]")}>
                  {/* Text zone */}
                  <div className={cn("relative rounded-2xl bg-card", compact ? "px-3.5 py-2" : "px-4 py-3")} style={{ caretColor: "transparent" }}>
                        <textarea ref={textareaRef} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={handleKeyDown} onClick={() => updateCaretRef.current()} onKeyUp={() => updateCaretRef.current()} onFocus={() => updateCaretRef.current()} onBlur={() => caretOpacity.set(0)} rows={1} placeholder="What would you like to research?" disabled={isStreaming} autoFocus className={cn("custom-scrollbar relative z-10 block w-full resize-none bg-transparent leading-relaxed", "text-foreground placeholder:text-muted-foreground/70 outline-none disabled:opacity-60", compact ? "text-sm max-h-32" : "text-[15px] max-h-60")} />
                        {/* Hidden mirror used purely to measure caret pixel position */}
                        <div ref={mirrorRef} aria-hidden className="pointer-events-none invisible absolute left-0 top-0 z-0 m-0 h-auto overflow-hidden">
                              <span ref={markerRef} />
                        </div>
                        <motion.span className="bg-primary pointer-events-none absolute top-3 left-4 z-20 w-[1.5px] rounded-full" style={{ x: springX, y: springY, height: "1.15em", opacity: caretOpacity }} />
                  </div>

                  {/* Control zone */}
                  <div className={cn("flex items-center justify-end gap-2 px-1.5", compact ? "pt-1.5" : "pt-2")}>
                        {isStreaming ? (
                              <button type="button" onClick={onStop} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-border" aria-label="Stop research" title="Stop research">
                                    <Square className="h-3.5 w-3.5 fill-current" />
                              </button>
                        ) : (
                              <button type="button" onClick={handleSubmit} disabled={!hasContent} className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors", hasContent ? "bg-primary text-primary-foreground hover:bg-primary/85" : "bg-primary/20 text-primary-foreground/70 cursor-default")} aria-label="Send" title="Enter to send · Shift+Enter for a new line">
                                    <ArrowUp className="h-4 w-4" />
                              </button>
                        )}
                  </div>
            </div>
      );
}
