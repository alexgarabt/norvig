import type { CorpusStats } from "@/lib/analysis";

interface Props {
  stats: CorpusStats;
  analysisTimeMs?: number;
}

function formatBytes(bytes: number) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function StatsBar({ stats, analysisTimeMs }: Props) {
  const items = [
    { label: "Corpus Size", value: formatBytes(stats.corpusSizeBytes) },
    { label: "Total Tokens", value: stats.totalTokens.toLocaleString() },
    { label: "Unique Words", value: stats.uniqueWords.toLocaleString() },
    {
      label: "Most Common",
      value: `"${stats.mostCommon.word}" (${stats.mostCommon.count.toLocaleString()})`,
    },
    ...(analysisTimeMs !== undefined
      ? [{ label: "Analysis Time", value: `${analysisTimeMs.toFixed(1)}ms` }]
      : []),
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {item.label}
          </p>
          <p className="text-sm font-mono font-semibold mt-1">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
