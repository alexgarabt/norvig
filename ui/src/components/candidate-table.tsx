import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Candidate } from "@/lib/norvig-browser";
import { ProbabilityBar } from "./probability-bar";

interface Props {
  candidates: Candidate[];
}

export function CandidateTable({ candidates }: Props) {
  const maxProb = candidates[0]?.probability ?? 0;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        Candidates ({candidates.length})
      </h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Word</TableHead>
              <TableHead className="w-48">Probability</TableHead>
              <TableHead className="w-32 text-right">P(word)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((c, i) => (
              <TableRow
                key={c.word}
                className={i === 0 ? "bg-emerald-50" : ""}
              >
                <TableCell className="text-muted-foreground font-mono">
                  {i + 1}
                </TableCell>
                <TableCell className="font-mono font-semibold">
                  {c.word}
                </TableCell>
                <TableCell>
                  <ProbabilityBar value={c.probability} max={maxProb} />
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {(c.probability * 100).toFixed(4)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
