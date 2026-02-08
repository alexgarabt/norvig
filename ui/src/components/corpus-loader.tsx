import { useEffect, useMemo, useState, useCallback } from "react";
import { NorvigBrowser } from "@/lib/norvig-browser";
import type { CorpusStats } from "@/lib/analysis";
import { Header } from "./header";
import { WordInput } from "./word-input";
import { AnalysisPanel } from "./analysis-panel";
import { StatsBar } from "./stats-bar";
import { ExampleWords } from "./example-words";
import { CorpusUploader } from "./corpus-uploader";
import { Footer } from "./footer";

export function CorpusLoader() {
  const [norvig, setNorvig] = useState<NorvigBrowser | null>(null);
  const [corpusStats, setCorpusStats] = useState<CorpusStats | null>(null);
  const [corpusName, setCorpusName] = useState("big.txt");
  const [isDefault, setIsDefault] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [word, setWord] = useState("");

  // Load default corpus
  useEffect(() => {
    const controller = new AbortController();

    fetch("/big.txt", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch corpus: ${res.status}`);
        return res.text();
      })
      .then((text) => {
        const instance = new NorvigBrowser(text);
        const stats = instance.getStats();
        stats.corpusSizeBytes = new Blob([text]).size;
        setNorvig(instance);
        setCorpusStats(stats);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const handleCorpusChange = useCallback(
    (text: string, name: string, sizeBytes: number) => {
      try {
        const instance = new NorvigBrowser(text);
        const stats = instance.getStats();
        stats.corpusSizeBytes = sizeBytes;
        setNorvig(instance);
        setCorpusStats(stats);
        setCorpusName(name);
        setIsDefault(false);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to process corpus"
        );
      }
    },
    []
  );

  const handleReset = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetch("/big.txt")
      .then((res) => res.text())
      .then((text) => {
        const instance = new NorvigBrowser(text);
        const stats = instance.getStats();
        stats.corpusSizeBytes = new Blob([text]).size;
        setNorvig(instance);
        setCorpusStats(stats);
        setCorpusName("big.txt");
        setIsDefault(true);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  const analysis = useMemo(() => {
    if (!norvig || !word.trim()) return null;
    return norvig.analyze(word);
  }, [norvig, word]);

  if (error && !norvig) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-semibold">Failed to load corpus</h2>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        <p className="text-muted-foreground">Loading corpus (6.5 MB)...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Header />
      <CorpusUploader
        corpusName={corpusName}
        onCorpusChange={handleCorpusChange}
        onReset={handleReset}
        isDefault={isDefault}
      />
      <WordInput value={word} onChange={setWord} />
      <ExampleWords onSelect={setWord} />
      {analysis && <AnalysisPanel result={analysis} />}
      {corpusStats && (
        <StatsBar
          stats={corpusStats}
          analysisTimeMs={analysis?.analysisTimeMs}
        />
      )}
      <Footer />
    </div>
  );
}
