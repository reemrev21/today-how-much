import {getCalendarDays, getMonthRange} from '../../src/utils/date';

describe('getCalendarDays', () => {
  it('returns 42 days for a month grid (6 weeks)', () => {
    const days = getCalendarDays('2026-04');
    expect(days).toHaveLength(42);
  });
  it('starts from the correct Sunday', () => {
    const days = getCalendarDays('2026-04');
    expect(days[0]).toBe('2026-03-29');
    expect(days[3]).toBe('2026-04-01');
  });
});

describe('getMonthRange', () => {
  it('returns first and last day of month', () => {
    expect(getMonthRange('2026-04')).toEqual({ start: '2026-04-01', end: '2026-04-30' });
  });
  it('handles February', () => {
    expect(getMonthRange('2026-02')).toEqual({ start: '2026-02-01', end: '2026-02-28' });
  });
});
