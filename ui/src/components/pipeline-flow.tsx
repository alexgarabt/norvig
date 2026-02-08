import type { AnalysisResult } from "@/lib/analysis";
import { StageCard } from "./stage-card";

interface Props {
  result: AnalysisResult;
}

function Arrow() {
  return (
    <div className="hidden md:flex items-center px-1 text-muted-foreground">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14m-7-7l7 7-7 7" />
      </svg>
    </div>
  );
}

export function PipelineFlow({ result }: Props) {
  const stages = [
    {
      id: "known" as const,
      label: "Known Word",
      sublabel: result.isKnown
        ? `P = ${(result.bestProbability * 100).toFixed(4)}%`
        : "Not in dictionary",
      count: result.isKnown ? 1 : 0,
      active: result.activePriority === "known",
    },
    {
      id: "distance1" as const,
      label: "Edit Distance 1",
      sublabel: `${result.edits1Count.toLocaleString()} generated`,
      count: result.knownEdits1.length,
      active: result.activePriority === "distance1",
    },
    {
      id: "distance2" as const,
      label: "Edit Distance 2",
      sublabel: `~${result.edits2Count.toLocaleString()} estimated`,
      count: result.knownEdits2.length,
      active: result.activePriority === "distance2",
    },
    {
      id: "fallback" as const,
      label: "Fallback",
      sublabel: "Original word",
      count: result.activePriority === "fallback" ? 1 : 0,
      active: result.activePriority === "fallback",
    },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        Priority Pipeline
      </h3>
      <div className="flex flex-col md:flex-row gap-2 md:gap-0">
        {stages.map((stage, i) => (
          <div
            key={stage.id}
            className="flex flex-col md:flex-row items-stretch md:items-center flex-1"
          >
            <StageCard
              id={stage.id}
              label={stage.label}
              sublabel={stage.sublabel}
              count={stage.count}
              active={stage.active}
            />
            {i < stages.length - 1 && <Arrow />}
          </div>
        ))}
      </div>
    </div>
  );
}
