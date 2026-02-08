import { Card, CardContent } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/analysis";

interface Props {
  result: AnalysisResult;
}

const PRIORITY_LABELS: Record<string, string> = {
  known: "Word is already known",
  distance1: "Found at edit distance 1",
  distance2: "Found at edit distance 2",
  fallback: "No correction found",
};

const PRIORITY_COLORS: Record<string, string> = {
  known: "text-emerald-600",
  distance1: "text-blue-600",
  distance2: "text-amber-600",
  fallback: "text-red-600",
};

export function CorrectionResult({ result }: Props) {
  const changed = result.bestCorrection !== result.inputWord;
  const colorClass = PRIORITY_COLORS[result.activePriority];

  return (
    <Card className="border-2">
      <CardContent className="p-6 text-center space-y-3">
        <div className="flex items-center justify-center gap-4 text-2xl md:text-3xl">
          <span className="font-mono text-muted-foreground">
            {result.inputWord}
          </span>
          <span className="text-muted-foreground">&rarr;</span>
          <span className={`font-mono font-bold ${colorClass}`}>
            {result.bestCorrection}
          </span>
        </div>
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <span className={colorClass}>
            {changed ? PRIORITY_LABELS[result.activePriority] : "Already correct"}
          </span>
          <span>&middot;</span>
          <span className="font-mono">
            P = {(result.bestProbability * 100).toFixed(4)}%
          </span>
          <span>&middot;</span>
          <span className="font-mono">{result.analysisTimeMs.toFixed(1)}ms</span>
        </div>
      </CardContent>
    </Card>
  );
}
