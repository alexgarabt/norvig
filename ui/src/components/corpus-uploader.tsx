import { useCallback, useRef, useState } from "react";

interface Props {
  corpusName: string;
  onCorpusChange: (text: string, name: string, sizeBytes: number) => void;
  onReset: () => void;
  isDefault: boolean;
}

export function CorpusUploader({
  corpusName,
  onCorpusChange,
  onReset,
  isDefault,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        onCorpusChange(text, file.name, file.size);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        setIsProcessing(false);
      };
      reader.readAsText(file);
    },
    [onCorpusChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div
      className={`flex flex-col sm:flex-row items-center gap-3 p-3 rounded-lg border-2 border-dashed transition-colors ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/20"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="flex-1 text-sm">
        <span className="text-muted-foreground">Corpus: </span>
        <span className="font-mono font-semibold">{corpusName}</span>
        {isDefault && (
          <span className="text-muted-foreground"> (default)</span>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="px-3 py-1.5 text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Upload corpus"}
        </button>
        {!isDefault && (
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted transition-colors cursor-pointer"
            onClick={onReset}
          >
            Reset to default
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,text/plain"
        className="hidden"
        onChange={handleFileSelect}
      />
      {isDragging && (
        <p className="text-sm text-primary">Drop file here</p>
      )}
    </div>
  );
}
