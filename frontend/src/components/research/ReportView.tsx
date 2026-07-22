import { useState } from "react";
import { motion } from "motion/react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { remarkCitationGroups } from "../../lib/citation";
import { Citation, CitationCarousel, CitationCarouselContent, CitationCarouselHeader, CitationCarouselIndex, CitationCarouselItem, CitationCarouselNext, CitationCarouselPagination, CitationCarouselPrev, CitationContent, CitationItem, CitationSourcesBadge, CitationTrigger, type CitationSource } from "./Citation";

interface ReportViewProps {
      report: string;
}

const remarkPlugins = [remarkGfm, remarkCitationGroups];

const markdownComponents: Components = {
      // @ts-expect-error -- custom element emitted by remarkCitationGroups, not part of react-markdown's built-in tag map
      "citation-group": ({ sources }: { sources: string }) => {
            const parsed: CitationSource[] = JSON.parse(sources);
            return (
                  <Citation citations={parsed}>
                        <CitationTrigger />
                        <CitationContent>
                              <CitationCarousel>
                                    <CitationCarouselHeader>
                                          <CitationSourcesBadge />
                                          <CitationCarouselPagination>
                                                <CitationCarouselPrev />
                                                <CitationCarouselIndex />
                                                <CitationCarouselNext />
                                          </CitationCarouselPagination>
                                    </CitationCarouselHeader>
                                    <CitationCarouselContent>
                                          {parsed.map((_, index) => (
                                                <CitationCarouselItem key={parsed[index].url} index={index}>
                                                      <CitationItem />
                                                </CitationCarouselItem>
                                          ))}
                                    </CitationCarouselContent>
                              </CitationCarousel>
                        </CitationContent>
                  </Citation>
            );
      },
};

export function ReportView({ report }: ReportViewProps) {
      const [copied, setCopied] = useState(false);

      const handleCopy = async () => {
            await navigator.clipboard.writeText(report);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
      };

      return (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="rounded-2xl border border-border bg-card px-5 py-4 sm:px-7 sm:py-6">
                  <div className="mb-1 flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Report</span>
                        <button type="button" onClick={handleCopy} className={cn("flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground")}>
                              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                              {copied ? "Copied" : "Copy"}
                        </button>
                  </div>

                  <div className="report-prose">
                        <ReactMarkdown remarkPlugins={remarkPlugins} components={markdownComponents}>
                              {report}
                        </ReactMarkdown>
                  </div>
            </motion.div>
      );
}
