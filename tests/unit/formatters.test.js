import { describe, it, expect } from 'vitest';
import { formatDecimal, formatCurrency, formatPrice, formatUsdPrice, formatDate, formatAmount, formatAmountDecimal, formatAmountPrice } from '../../src/utils/common/formatters.js';

describe('Global Formatting Utilities', () => {
  describe('formatDecimal', () => {
    it('truncates values to 2 decimal places without rounding', () => {
      expect(formatDecimal(5.19999)).toBe('5.19');
      expect(formatDecimal(10.5678)).toBe('10.56');
      expect(formatDecimal(45)).toBe('45.00');
      expect(formatDecimal(45.5)).toBe('45.50');
      expect(formatDecimal('45.999')).toBe('45.99');
    });

    it('handles negative values correctly', () => {
      expect(formatDecimal(-5.199)).toBe('-5.19');
      expect(formatDecimal(-10.5678)).toBe('-10.56');
    });

    it('cleans formatted values and extracts numeric parts', () => {
      expect(formatDecimal('USD$ 9.99')).toBe('9.99');
      expect(formatDecimal('USD$ 2,698.00')).toBe('2698.00');
      expect(formatDecimal('$45.00')).toBe('45.00');
    });

    it('handles null, undefined, empty, or invalid input gracefully', () => {
      expect(formatDecimal(null)).toBe('0.00');
      expect(formatDecimal(undefined)).toBe('0.00');
      expect(formatDecimal('')).toBe('0.00');
      expect(formatDecimal('abc')).toBe('0.00');
    });
  });

  describe('formatCurrency', () => {
    it('formats values as currency with standard symbols', () => {
      expect(formatCurrency(45.999, 'USD')).toBe('$45.99');
      expect(formatCurrency(45.999, 'EUR')).toBe('€45.99');
      expect(formatCurrency(45.999, 'GBP')).toBe('£45.99');
      expect(formatCurrency(45.999, 'JPY')).toBe('45.99'); // Fallback to empty if not mapped
    });
  });

  describe('formatPrice', () => {
    it('formats values to standard project format YYY $X.XX', () => {
      expect(formatPrice(45, 'USD')).toBe('USD $45.00');
      expect(formatPrice(45.5, 'USD')).toBe('USD $45.50');
      expect(formatPrice('45.999', 'USD')).toBe('USD $45.99');
    });
  });

  describe('formatUsdPrice', () => {
    it('formats values to standard USD format', () => {
      expect(formatUsdPrice(45)).toBe('USD $45.00');
      expect(formatUsdPrice('45.999')).toBe('USD $45.99');
    });
  });

  describe('formatDate', () => {
    it('formats standard string dates timezone-independently', () => {
      expect(formatDate('2022/01/22')).toBe('22nd JAN 2022');
      expect(formatDate('2022-01-22')).toBe('22nd JAN 2022');
      expect(formatDate('2022-01-01')).toBe('1st JAN 2022');
      expect(formatDate('2022-05-11')).toBe('11th MAY 2022');
      expect(formatDate('2022-12-03')).toBe('3rd DEC 2022');
    });

    it('formats Date objects correctly', () => {
      const date = new Date(2022, 0, 22);
      expect(formatDate(date)).toBe('22nd JAN 2022');
    });

    it('handles existing formatted dates or invalid dates gracefully', () => {
      expect(formatDate('22 Jan 2022')).toBe('22nd JAN 2022');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('not-a-date')).toBe('not-a-date');
    });
  });

  describe('formatAmount', () => {
    it('formats numbers with thousand-separator commas', () => {
      expect(formatAmount(5000)).toBe('5,000');
      expect(formatAmount(50000)).toBe('50,000');
      expect(formatAmount(1234567)).toBe('1,234,567');
      expect(formatAmount(1000)).toBe('1,000');
    });

    it('preserves natural decimal precision', () => {
      expect(formatAmount(1000000.5)).toBe('1,000,000.5');
      expect(formatAmount(5000.123)).toBe('5,000.123');
    });

    it('handles numbers below 1000 without commas', () => {
      expect(formatAmount(999)).toBe('999');
      expect(formatAmount(0)).toBe('0');
    });

    it('handles negative numbers correctly', () => {
      expect(formatAmount(-5000)).toBe('-5,000');
      expect(formatAmount(-1234567)).toBe('-1,234,567');
    });

    it('handles null, undefined, and invalid input gracefully', () => {
      expect(formatAmount(null)).toBe('0');
      expect(formatAmount(undefined)).toBe('0');
      expect(formatAmount('abc')).toBe('0');
    });
  });

  describe('formatAmountDecimal', () => {
    it('formats numbers with thousand-separator commas and 2 decimal places', () => {
      expect(formatAmountDecimal(5000)).toBe('5,000.00');
      expect(formatAmountDecimal(50000)).toBe('50,000.00');
      expect(formatAmountDecimal(1234567)).toBe('1,234,567.00');
    });

    it('truncates to 2 decimal places without rounding', () => {
      expect(formatAmountDecimal(50000.999)).toBe('50,000.99');
      expect(formatAmountDecimal(123456.1)).toBe('123,456.10');
    });

    it('handles negative numbers correctly', () => {
      expect(formatAmountDecimal(-1234.56)).toBe('-1,234.56');
      expect(formatAmountDecimal(-50000)).toBe('-50,000.00');
    });

    it('handles null, undefined, and invalid input gracefully', () => {
      expect(formatAmountDecimal(null)).toBe('0.00');
      expect(formatAmountDecimal(undefined)).toBe('0.00');
      expect(formatAmountDecimal('abc')).toBe('0.00');
    });
  });

  describe('formatAmountPrice', () => {
    it('formats values as full price with thousand-separator commas', () => {
      expect(formatAmountPrice(5000)).toBe('USD $5,000.00');
      expect(formatAmountPrice(50000)).toBe('USD $50,000.00');
      expect(formatAmountPrice(1234567)).toBe('USD $1,234,567.00');
    });

    it('supports different currency codes', () => {
      expect(formatAmountPrice(5000, 'EUR')).toBe('EUR €5,000.00');
      expect(formatAmountPrice(5000, 'GBP')).toBe('GBP £5,000.00');
    });

    it('handles negative numbers correctly', () => {
      expect(formatAmountPrice(-5000)).toBe('USD $-5,000.00');
    });

    it('handles null and undefined gracefully', () => {
      expect(formatAmountPrice(null)).toBe('USD $0.00');
      expect(formatAmountPrice(undefined)).toBe('USD $0.00');
    });
  });
});
