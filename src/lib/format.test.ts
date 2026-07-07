import { describe, expect, it } from 'vitest';
import { formatCompact, formatInteger, formatOrdinal, formatPercent, formatUsd } from './format';

describe('formatCompact', () => {
  it('formats billions, millions and thousands', () => {
    expect(formatCompact(1_425_887_337)).toBe('1.43B');
    expect(formatCompact(267_663_435)).toBe('267.7M');
    expect(formatCompact(5_637)).toBe('6K');
    expect(formatCompact(742)).toBe('742');
  });
});

describe('formatInteger', () => {
  it('adds thousands separators', () => {
    expect(formatInteger(1425887337)).toBe('1,425,887,337');
  });
});

describe('formatUsd', () => {
  it('renders a currency string with no decimals', () => {
    expect(formatUsd(76330)).toBe('$76,330');
  });
});

describe('formatPercent', () => {
  it('renders one decimal place', () => {
    expect(formatPercent(91.8)).toBe('91.8%');
    expect(formatPercent(100)).toBe('100.0%');
  });
});

describe('formatOrdinal', () => {
  it('applies correct suffixes including the teen exceptions', () => {
    expect(formatOrdinal(1)).toBe('1st');
    expect(formatOrdinal(2)).toBe('2nd');
    expect(formatOrdinal(3)).toBe('3rd');
    expect(formatOrdinal(4)).toBe('4th');
    expect(formatOrdinal(11)).toBe('11th');
    expect(formatOrdinal(12)).toBe('12th');
    expect(formatOrdinal(13)).toBe('13th');
    expect(formatOrdinal(21)).toBe('21st');
    expect(formatOrdinal(112)).toBe('112th');
  });
});
