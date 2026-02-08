import fs from 'node:fs';
import { counter } from './utils.js';
import type { NorvigConfig, Candidate } from './types.js';

const EN_ALPHABET = new Set<string>(
    'abcdefghijklmnopqrstuvwxyz'.split('')
);

/**
 * Probabilistic spell corrector based on Peter Norvig's 2007 algorithm.
 *
 * Uses a corpus of text to build a unigram language model P(c),
 * then finds corrections by generating all strings within edit
 * distance 1 or 2 that exist in the corpus, ranked by frequency.
 *
 * The error model is simplified: all edits at the same distance
 * are treated as equally probable, so the selection reduces to
 * argmax P(c) over the first non-empty priority level:
 *   1. The word itself (if known)
 *   2. Known words at edit distance 1
 *   3. Known words at edit distance 2
 *   4. The original word unchanged (fallback)
 *
 * @see 'https://norvig.com/spell-correct.html'
 */
export class Norvig {
    private alphabet: Set<string>;
    private words: Map<string, number>;
    private totalTokens: number;

    constructor(config: NorvigConfig) {
        this.alphabet = config.alphabet ?? EN_ALPHABET;

        const text = fs.readFileSync(config.corpus, 'utf8');
        const tokens = text.toLowerCase().match(/[a-z]+/g);

        if (!tokens) throw new Error(`No words found in corpus: ${config.corpus}`);

        this.words = counter(tokens);
        this.totalTokens = [...this.words.values()].reduce((a, b) => a + b, 0);
    }

    /**
     * Generate all strings that are one edit away from `word`.
     * Edits: deletion, transposition, substitution, insertion.
     * Returns all results, including non-words.
     */
    private edits1(word: string): Set<string> {
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

    /**
     * Generate all known words that are one edit away from `word`.
     * Same operations as edits1, but filters against the dictionary inline.
     */
    private knownEdits1(word: string): Set<string> {
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

    /**
     * Generate all known words that are two edits away from `word`.
     * Uses unfiltered edits1 as the intermediate step (non-words at
     * distance 1 can still lead to real words at distance 2), then
     * filters the second level against the dictionary inline to avoid
     * materializing ~160k strings.
     */
    private knownEdits2(word: string): Set<string> {
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

    /**
     * Returns the first non-empty candidate set following Norvig's
     * priority hierarchy:
     *   distance 0 > distance 1 > distance 2 > original word
     */
    public candidates(word: string): Set<string> {
        if (this.words.has(word)) return new Set([word]);

        const dist1 = this.knownEdits1(word);
        if (dist1.size > 0) return dist1;

        const dist2 = this.knownEdits2(word);
        if (dist2.size > 0) return dist2;

        return new Set([word]);
    }

    /** Unigram probability P(word) = count(word) / N */
    public probability(word: string): number {
        return (this.words.get(word) ?? 0) / this.totalTokens;
    }

    /** Returns the single most probable correction */
    public correction(word: string): string;
    /** Returns the top `n` most probable corrections */
    public correction(word: string, n: number): Candidate[];
    public correction(word: string, n?: number): string | Candidate[] {
        const ranked = [...this.candidates(word)]
            .map(w => ({ word: w, probability: this.probability(w) }))
            .sort((a, b) => b.probability - a.probability);

        if (n === undefined) return ranked[0]?.word ?? word;
        return ranked.slice(0, n);
    }
}
