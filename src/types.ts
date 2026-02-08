/**
 * Configuration for the Norvig spell corrector
 */
export interface NorvigConfig {
    corpus: string;
    alphabet?: Set<string>;
}

/**
 * A correction candidate with its corpus probability
 */
export interface Candidate {
    word: string;
    probability: number;
}
