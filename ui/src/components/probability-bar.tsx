interface Props {
  value: number;
  max: number;
}

export function ProbabilityBar({ value, max }: Props) {
  const pct = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-primary/60 rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
