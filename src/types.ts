/**
 * Configuration for the Norvig spell corrector
 */
export interface NorvigConfig {
    /** Path to a plain text corpus file */
    corpus: string;
    /** Alphabet to use for generating edits. Defaults to English lowercase a-z */
    alphabet?: Set<string>;
}

/**
 * A correction candidate with its corpus probability
 */
export interface Candidate {
    word: string;
    probability: number;
}
