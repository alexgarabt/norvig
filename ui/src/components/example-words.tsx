import { Badge } from "@/components/ui/badge";

const EXAMPLES = [
  "speling",
  "korrectud",
  "bycycle",
  "inconvient",
  "peotry",
  "somthing",
  "languege",
  "definately",
];

interface Props {
  onSelect: (word: string) => void;
}

export function ExampleWords({ onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm text-muted-foreground self-center">Try:</span>
      {EXAMPLES.map((word) => (
        <Badge
          key={word}
          variant="secondary"
          className="cursor-pointer font-mono hover:bg-primary/10 transition-colors"
          onClick={() => onSelect(word)}
        >
          {word}
        </Badge>
      ))}
    </div>
  );
}
