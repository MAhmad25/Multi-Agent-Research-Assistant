const SUGGESTIONS = ["How are AI agents changing software development ?", "Why are LinkedIn posts becoming so AI-generated ?", "How is Instagram's algorithm different ?"];
interface SuggestionChipsProps {
      onPick: (topic: string) => void;
}

export function SuggestionChips({ onPick }: SuggestionChipsProps) {
      return (
            <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((topic) => (
                        <button key={topic} type="button" onClick={() => onPick(topic)} className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-accent hover:text-accent-foreground">
                              {topic}
                        </button>
                  ))}
            </div>
      );
}
