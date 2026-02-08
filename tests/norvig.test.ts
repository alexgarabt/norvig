import { describe, test, before } from 'node:test';
import assert from 'node:assert/strict';
import { Norvig } from '../src/norvig.js';
import { counter } from '../src/utils.js';

// ─── utils ───────────────────────────────────────────────────────────

describe('counter', () => {
    test('counts occurrences of each element', () => {
        const result = counter(['a', 'b', 'a', 'c', 'a', 'b']);
        assert.equal(result.get('a'), 3);
        assert.equal(result.get('b'), 2);
        assert.equal(result.get('c'), 1);
    });

    test('returns empty map for empty array', () => {
        const result = counter([]);
        assert.equal(result.size, 0);
    });

    test('handles single element', () => {
        const result = counter(['x']);
        assert.equal(result.get('x'), 1);
        assert.equal(result.size, 1);
    });
});

// ─── norvig ──────────────────────────────────────────────────────────

describe('Norvig', () => {
    let spell: Norvig;

    before(() => {
        spell = new Norvig({ corpus: './big.txt' });
    });

    // These are Norvig's own unit tests from spell-correct.html

    describe('correction (single best)', () => {
        test('insert: speling -> spelling', () => {
            assert.equal(spell.correction('speling'), 'spelling');
        });

        test('replace 2: korrectud -> corrected', () => {
            assert.equal(spell.correction('korrectud'), 'corrected');
        });

        test('replace: bycycle -> bicycle', () => {
            assert.equal(spell.correction('bycycle'), 'bicycle');
        });

        test('insert 2: inconvient -> inconvenient', () => {
            assert.equal(spell.correction('inconvient'), 'inconvenient');
        });

        test('delete: arrainged -> arranged', () => {
            assert.equal(spell.correction('arrainged'), 'arranged');
        });

        test('transpose: peotry -> poetry', () => {
            assert.equal(spell.correction('peotry'), 'poetry');
        });

        test('transpose + delete: peotryy -> poetry', () => {
            assert.equal(spell.correction('peotryy'), 'poetry');
        });

        test('known word is returned unchanged', () => {
            assert.equal(spell.correction('word'), 'word');
        });

        test('unknown word with no candidates is returned unchanged', () => {
            assert.equal(spell.correction('quintessential'), 'quintessential');
        });
    });

    describe('candidates', () => {
        test('known word returns itself', () => {
            const c = spell.candidates('the');
            assert.equal(c.size, 1);
            assert.ok(c.has('the'));
        });

        test('distance 1 candidates are found', () => {
            const c = spell.candidates('speling');
            assert.ok(c.has('spelling'));
        });

        test('distance 2 candidates are found', () => {
            const c = spell.candidates('somethin');
            assert.ok(c.size > 0);
        });

        test('nonsense returns itself as fallback', () => {
            const c = spell.candidates('zzzzqqqq');
            assert.equal(c.size, 1);
            assert.ok(c.has('zzzzqqqq'));
        });
    });

    describe('probability', () => {
        test('"the" has the highest probability', () => {
            assert.ok(spell.probability('the') > 0.07);
            assert.ok(spell.probability('the') < 0.08);
        });

        test('unknown word has probability 0', () => {
            assert.equal(spell.probability('zzzzqqqq'), 0);
        });

        test('probabilities are between 0 and 1', () => {
            const p = spell.probability('hello');
            assert.ok(p >= 0 && p <= 1);
        });
    });

    describe('correction with n (top n results)', () => {
        test('returns array of Candidate objects', () => {
            const results = spell.correction('speling', 3);
            assert.ok(Array.isArray(results));
            assert.ok(results.length <= 3);
            assert.ok(results[0]!.word);
            assert.ok(typeof results[0]!.probability === 'number');
        });

        test('results are sorted by probability descending', () => {
            const results = spell.correction('somthing', 5);
            for (let i = 1; i < results.length; i++) {
                assert.ok(results[i - 1]!.probability >= results[i]!.probability);
            }
        });

        test('best result matches single correction', () => {
            const single = spell.correction('speling');
            const top = spell.correction('speling', 1);
            assert.equal(top[0]!.word, single);
        });
    });

    describe('edge cases', () => {
        test('empty string', () => {
            const result = spell.correction('');
            assert.equal(typeof result, 'string');
        });

        test('single character', () => {
            const result = spell.correction('a');
            assert.equal(result, 'a'); // 'a' is a known word
        });

        test('already correct word', () => {
            assert.equal(spell.correction('hello'), 'hello');
        });
    });
});
