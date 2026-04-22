import {formatAmount, formatAmountSigned} from '../../src/utils/format';

describe('formatAmount', () => {
  it('formats with comma separator', () => {
    expect(formatAmount(1234567)).toBe('1,234,567');
  });
  it('handles zero', () => {
    expect(formatAmount(0)).toBe('0');
  });
});

describe('formatAmountSigned', () => {
  it('adds + for income', () => {
    expect(formatAmountSigned(50000, 'income')).toBe('+50,000');
  });
  it('adds - for expense', () => {
    expect(formatAmountSigned(50000, 'expense')).toBe('-50,000');
  });
});
