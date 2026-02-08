import type { AnalysisResult, ActivePriority, CorpusStats } from "./analysis";

export interface Candidate {
  word: string;
  probability: number;
}

function counter<T>(array: T[]): Map<T, number> {
  const counts = new Map<T, number>();
  for (const value of array) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

const EN_ALPHABET = new Set<string>("abcdefghijklmnopqrstuvwxyz".split(""));

export class NorvigBrowser {
  private alphabet: Set<string>;
  private words: Map<string, number>;
  private totalTokens: number;

  constructor(text: string, alphabet?: Set<string>) {
    this.alphabet = alphabet ?? EN_ALPHABET;
    const tokens = text.toLowerCase().match(/[a-z]+/g);
    if (!tokens) throw new Error("No words found in corpus text");
    this.words = counter(tokens);
    this.totalTokens = [...this.words.values()].reduce((a, b) => a + b, 0);
  }

  public edits1(word: string): Set<string> {
    const results = new Set<string>();

    for (let i = 0; i <= word.length; i++) {
      const L = word.slice(0, i);
      const R = word.slice(i);

      if (R.length > 0) results.add(L + R.slice(1));
      if (R.length > 1) results.add(L + R[1] + R[0] + R.slice(2));
      if (R.length > 0)
        for (const c of this.alphabet) results.add(L + c + R.slice(1));
      for (const c of this.alphabet) results.add(L + c + R);
    }

    return results;
  }

  public knownEdits1(word: string): Set<string> {
    const results = new Set<string>();

    for (let i = 0; i <= word.length; i++) {
      const L = word.slice(0, i);
      const R = word.slice(i);
      let c: string;

      if (R.length > 0) {
        c = L + R.slice(1);
        if (this.words.has(c)) results.add(c);
      }
      if (R.length > 1) {
        c = L + R[1] + R[0] + R.slice(2);
        if (this.words.has(c)) results.add(c);
      }
      if (R.length > 0)
        for (const ch of this.alphabet) {
          c = L + ch + R.slice(1);
          if (this.words.has(c)) results.add(c);
        }
      for (const ch of this.alphabet) {
        c = L + ch + R;
        if (this.words.has(c)) results.add(c);
      }
    }

    return results;
  }

  public knownEdits2(word: string): Set<string> {
    const results = new Set<string>();

    for (const e1 of this.edits1(word)) {
      for (let i = 0; i <= e1.length; i++) {
        const L = e1.slice(0, i);
        const R = e1.slice(i);
        let c: string;

        if (R.length > 0) {
          c = L + R.slice(1);
          if (this.words.has(c)) results.add(c);
        }
        if (R.length > 1) {
          c = L + R[1] + R[0] + R.slice(2);
          if (this.words.has(c)) results.add(c);
        }
        if (R.length > 0)
          for (const ch of this.alphabet) {
            c = L + ch + R.slice(1);
            if (this.words.has(c)) results.add(c);
          }
        for (const ch of this.alphabet) {
          c = L + ch + R;
          if (this.words.has(c)) results.add(c);
        }
      }
    }

    return results;
  }

  public candidates(word: string): Set<string> {
    if (this.words.has(word)) return new Set([word]);

    const dist1 = this.knownEdits1(word);
    if (dist1.size > 0) return dist1;

    const dist2 = this.knownEdits2(word);
    if (dist2.size > 0) return dist2;

    return new Set([word]);
  }

  public probability(word: string): number {
    return (this.words.get(word) ?? 0) / this.totalTokens;
  }

  public correction(word: string): string;
  public correction(word: string, n: number): Candidate[];
  public correction(word: string, n?: number): string | Candidate[] {
    const ranked = [...this.candidates(word)]
      .map((w) => ({ word: w, probability: this.probability(w) }))
      .sort((a, b) => b.probability - a.probability);

    if (n === undefined) return ranked[0]?.word ?? word;
    return ranked.slice(0, n);
  }

  public analyze(word: string): AnalysisResult {
    const start = performance.now();
    const lowerWord = word.toLowerCase().trim();

    if (!lowerWord || !/^[a-z]+$/.test(lowerWord)) {
      return {
        inputWord: lowerWord || "",
        isKnown: false,
        edits1Count: 0,
        knownEdits1: [],
        edits2Count: 0,
        knownEdits2: [],
        activePriority: "fallback",
        candidates: [],
        bestCorrection: lowerWord || "",
        bestProbability: 0,
        inputFrequency: 0,
        analysisTimeMs: performance.now() - start,
      };
    }

    const isKnown = this.words.has(lowerWord);
    const e1Set = this.edits1(lowerWord);
    const edits1Count = e1Set.size;

    let activePriority: ActivePriority;
    let candidateWords: Set<string>;
    let knownE1: Candidate[] = [];
    let knownE2: Candidate[] = [];

    if (isKnown) {
      activePriority = "known";
      candidateWords = new Set([lowerWord]);

      // Still compute known edits for display
      const ke1 = this.knownEdits1(lowerWord);
      knownE1 = [...ke1].map((w) => ({
        word: w,
        probability: this.probability(w),
      }));
    } else {
      const ke1 = this.knownEdits1(lowerWord);
      knownE1 = [...ke1].map((w) => ({
        word: w,
        probability: this.probability(w),
      }));

      if (ke1.size > 0) {
        activePriority = "distance1";
        candidateWords = ke1;
      } else {
        const ke2 = this.knownEdits2(lowerWord);
        knownE2 = [...ke2].map((w) => ({
          word: w,
          probability: this.probability(w),
        }));

        if (ke2.size > 0) {
          activePriority = "distance2";
          candidateWords = ke2;
        } else {
          activePriority = "fallback";
          candidateWords = new Set([lowerWord]);
        }
      }
    }

    // Estimate edits2 count without materializing the full set
    const avgLen = lowerWord.length;
    const edits2Count = Math.round(edits1Count * (54 * avgLen + 25));

    const candidates = [...candidateWords]
      .map((w) => ({ word: w, probability: this.probability(w) }))
      .sort((a, b) => b.probability - a.probability);

    const analysisTimeMs = performance.now() - start;

    return {
      inputWord: lowerWord,
      isKnown,
      edits1Count,
      knownEdits1: knownE1.sort((a, b) => b.probability - a.probability),
      edits2Count,
      knownEdits2: knownE2.sort((a, b) => b.probability - a.probability),
      activePriority,
      candidates,
      bestCorrection: candidates[0]?.word ?? lowerWord,
      bestProbability: candidates[0]?.probability ?? 0,
      inputFrequency: this.words.get(lowerWord) ?? 0,
      analysisTimeMs,
    };
  }

  public getStats(): CorpusStats {
    let mostCommonWord = "";
    let mostCommonCount = 0;
    for (const [word, count] of this.words) {
      if (count > mostCommonCount) {
        mostCommonWord = word;
        mostCommonCount = count;
      }
    }
    return {
      totalTokens: this.totalTokens,
      uniqueWords: this.words.size,
      mostCommon: { word: mostCommonWord, count: mostCommonCount },
      corpusSizeBytes: 0,
    };
  }
}
