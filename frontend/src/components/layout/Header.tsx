import { SquarePen } from "lucide-react";
interface HeaderProps {
      onNewResearch: () => void;
}

export function Header({ onNewResearch }: HeaderProps) {
      return (
            <header className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-6">
                  <div className="flex items-center gap-2">
                        <img src="/favicon.svg" className="h-6 object-cover w-6" />
                        <span className="text-sm font-medium text-foreground">Research Assistant</span>
                  </div>
                  <button type="button" onClick={onNewResearch} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary">
                        <SquarePen className="h-3.5 w-3.5" />
                        New research
                  </button>
            </header>
      );
}
