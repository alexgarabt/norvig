import type { Candidate } from "./norvig-browser";

export type ActivePriority = "known" | "distance1" | "distance2" | "fallback";

export interface AnalysisResult {
  inputWord: string;
  isKnown: boolean;
  edits1Count: number;
  knownEdits1: Candidate[];
  edits2Count: number;
  knownEdits2: Candidate[];
  activePriority: ActivePriority;
  candidates: Candidate[];
  bestCorrection: string;
  bestProbability: number;
  inputFrequency: number;
  analysisTimeMs: number;
}

export interface CorpusStats {
  totalTokens: number;
  uniqueWords: number;
  mostCommon: { word: string; count: number };
  corpusSizeBytes: number;
}
