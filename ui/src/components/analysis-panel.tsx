import type { AnalysisResult } from "@/lib/analysis";
import { PipelineFlow } from "./pipeline-flow";
import { CandidateTable } from "./candidate-table";
import { CorrectionResult } from "./correction-result";

interface Props {
  result: AnalysisResult;
}

export function AnalysisPanel({ result }: Props) {
  return (
    <div className="space-y-6">
      <CorrectionResult result={result} />
      <PipelineFlow result={result} />
      {result.candidates.length > 1 && (
        <CandidateTable candidates={result.candidates} />
      )}
    </div>
  );
}
