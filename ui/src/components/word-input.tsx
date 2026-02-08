import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function WordInput({ value, onChange }: Props) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue.toLowerCase().trim());
    }, 150);
    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  return (
    <div className="space-y-2">
      <label htmlFor="word-input" className="text-sm font-medium">
        Type a word to check
      </label>
      <Input
        id="word-input"
        type="text"
        placeholder="Type a word..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="font-mono text-lg"
        autoFocus
      />
    </div>
  );
}
