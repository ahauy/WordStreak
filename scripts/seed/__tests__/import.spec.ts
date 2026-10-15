import { describe, it, expect } from 'vitest';
import { parseRawCsv, runStage1 } from '../01-import';
import path from 'node:path';

describe('TC-LIB-001: Raw CSV Parser', () => {
  it('should correctly parse raw CSV lines with headword, pos, freq_rank, and freq_value', () => {
    const sampleCsv = `headword,pos,freq_rank,freq_value
accommodate,v,120,45.2
beneficial,adj,350,22.1`;

    const parsed = parseRawCsv(sampleCsv, 'TSL');

    expect(parsed).toEqual([
      {
        headword: 'accommodate',
        pos: 'v',
        freqRank: 120,
        freqValue: 45.2,
        listCode: 'TSL',
      },
      {
        headword: 'beneficial',
        pos: 'adj',
        freqRank: 350,
        freqValue: 22.1,
        listCode: 'TSL',
      },
    ]);
  });

  it('should handle hyphenated words and whitespace trimming (EC-LIB-001)', () => {
    const sampleCsv = `headword,pos,freq_rank,freq_value
  up-to-date  , adj , 1200 , 3.8  
by-product,n,1250,3.2`;

    const parsed = parseRawCsv(sampleCsv, 'TSL');

    expect(parsed[0].headword).toBe('up-to-date');
    expect(parsed[0].pos).toBe('adj');
    expect(parsed[0].freqRank).toBe(1200);
    expect(parsed[0].freqValue).toBe(3.8);
    expect(parsed[1].headword).toBe('by-product');
  });

  it('should execute runStage1 and load raw files to produce 01-raw-entries.json structure', async () => {
    const rawDir = path.resolve(__dirname, '../data/raw');
    const result = await runStage1({ rawDir });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('headword');
    expect(result[0]).toHaveProperty('pos');
    expect(result[0]).toHaveProperty('freqRank');
  });
});
