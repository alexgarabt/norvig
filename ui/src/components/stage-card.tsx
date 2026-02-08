import { Card, CardContent } from "@/components/ui/card";
import type { ActivePriority } from "@/lib/analysis";

interface Props {
  id: ActivePriority;
  label: string;
  sublabel: string;
  count: number;
  active: boolean;
}

const STAGE_STYLES: Record<
  ActivePriority,
  { border: string; bg: string; text: string; activeBorder: string }
> = {
  known: {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    activeBorder: "border-emerald-500 ring-2 ring-emerald-200",
  },
  distance1: {
    border: "border-blue-200",
    bg: "bg-blue-50",
    text: "text-blue-700",
    activeBorder: "border-blue-500 ring-2 ring-blue-200",
  },
  distance2: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-700",
    activeBorder: "border-amber-500 ring-2 ring-amber-200",
  },
  fallback: {
    border: "border-red-200",
    bg: "bg-red-50",
    text: "text-red-700",
    activeBorder: "border-red-500 ring-2 ring-red-200",
  },
};

export function StageCard({ id, label, sublabel, count, active }: Props) {
  const styles = STAGE_STYLES[id];

  return (
    <Card
      className={`flex-1 transition-all duration-300 ${
        active
          ? `${styles.activeBorder} ${styles.bg}`
          : `${styles.border} opacity-40`
      }`}
    >
      <CardContent className="p-4 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-sm font-semibold ${
              active ? styles.text : "text-muted-foreground"
            }`}
          >
            {label}
          </span>
          {active && (
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded-full ${styles.bg} ${styles.text} border ${styles.border}`}
            >
              ACTIVE
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
        <p className="text-lg font-mono font-bold">
          {count} {count === 1 ? "match" : "matches"}
        </p>
      </CardContent>
    </Card>
  );
}
