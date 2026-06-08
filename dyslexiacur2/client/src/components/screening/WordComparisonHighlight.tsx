import type { WordComparisonItem } from "@/types/screening";

interface WordComparisonHighlightProps {
  items: WordComparisonItem[];
}

export function WordComparisonHighlight({ items }: WordComparisonHighlightProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-background/60 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">
        Word-level comparison
      </p>

      <div className="flex flex-wrap gap-x-2 gap-y-2">
        {items.map((item, idx) => {
          const status = item.status;
          const classes =
            status === "wrong"
              ? "text-red-600 font-semibold"
              : status === "missing"
                ? "underline decoration-red-600 decoration-2 underline-offset-4 text-foreground"
                : "text-foreground";

          const tooltip =
            status === "wrong"
              ? `Expected: ${item.expected ?? item.word}${item.predicted ? ` | Heard: ${item.predicted}` : ""}`
              : status === "missing"
                ? `Expected: ${item.expected ?? item.word}`
                : undefined;

          return (
            <span key={`${item.word}-${idx}`} className={classes} title={tooltip}>
              {item.word}
            </span>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/80" />
          Correct
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
          Wrong
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-3 bg-red-600" />
          Missing
        </span>
      </div>
    </div>
  );
}

