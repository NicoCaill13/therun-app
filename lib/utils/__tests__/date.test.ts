import {
  formatEventDate,
  formatCompletedDate,
  formatTime,
  isDateInPast,
  isToday,
  isTomorrow,
} from '../date';

describe('Date Utils', () => {
  // Mock date for consistent testing
  const mockNow = new Date('2026-01-31T10:00:00Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockNow);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('formatEventDate', () => {
    it('should format date as "Aujourd\'hui" when date is today', () => {
      const todayDate = '2026-01-31T14:30:00Z';
      const result = formatEventDate(todayDate);
      expect(result).toContain("Aujourd'hui");
      // Time varies based on timezone, just check format
      expect(result).toMatch(/a \d{2}:\d{2}/);
    });

    it('should format date as "Demain" when date is tomorrow', () => {
      const tomorrowDate = '2026-02-01T09:00:00Z';
      const result = formatEventDate(tomorrowDate);
      expect(result).toContain('Demain');
      expect(result).toMatch(/a \d{2}:\d{2}/);
    });

    it('should format date with full weekday for other dates', () => {
      const futureDate = '2026-02-15T16:00:00Z';
      const result = formatEventDate(futureDate);
      // Should contain French weekday and time (French months may contain accents)
      expect(result).toContain(' a ');
      expect(result).toMatch(/\d{2}:\d{2}/);
      // Should not start with "Aujourd'hui" or "Demain"
      expect(result).not.toContain("Aujourd'hui");
      expect(result).not.toContain('Demain');
    });

    it('should include year when specified in options', () => {
      const futureDate = '2027-06-15T10:00:00Z';
      const result = formatEventDate(futureDate, { includeYear: true });
      expect(result).toContain('2027');
    });

    it('should include year when date is in different year', () => {
      const differentYearDate = '2027-03-15T10:00:00Z';
      const result = formatEventDate(differentYearDate);
      expect(result).toContain('2027');
    });

    it('should not include year for same year dates by default', () => {
      const sameYearDate = '2026-06-15T10:00:00Z';
      const result = formatEventDate(sameYearDate);
      expect(result).not.toContain('2026');
    });
  });

  describe('formatCompletedDate', () => {
    it('should format completed date correctly', () => {
      const completedDate = '2026-01-30T15:00:00Z';
      const result = formatCompletedDate(completedDate);
      expect(result).toContain('30');
      expect(result).toContain('janvier');
      expect(result).toContain('2026');
    });

    it('should handle different months', () => {
      const decemberDate = '2025-12-25T10:00:00Z';
      const result = formatCompletedDate(decemberDate);
      expect(result).toContain('25');
      expect(result).toContain('2025');
    });
  });

  describe('formatTime', () => {
    it('should format time in HH:mm format', () => {
      const dateWithTime = '2026-01-31T14:30:00Z';
      const result = formatTime(dateWithTime);
      // Time format should be HH:mm (timezone may affect actual value)
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should return consistent format for any time', () => {
      const midnight = '2026-01-31T00:00:00Z';
      const result = formatTime(midnight);
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should handle various times', () => {
      const earlyMorning = '2026-01-31T09:05:00Z';
      const result = formatTime(earlyMorning);
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('isDateInPast', () => {
    it('should return true for past dates', () => {
      const pastDate = '2026-01-30T10:00:00Z';
      expect(isDateInPast(pastDate)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = '2026-02-15T10:00:00Z';
      expect(isDateInPast(futureDate)).toBe(false);
    });

    it('should return false for dates after current time today', () => {
      const laterToday = '2026-01-31T23:59:00Z';
      expect(isDateInPast(laterToday)).toBe(false);
    });
  });

  describe('isToday', () => {
    it('should return true for today dates', () => {
      const todayMorning = '2026-01-31T06:00:00Z';
      const todayEvening = '2026-01-31T22:00:00Z';
      expect(isToday(todayMorning)).toBe(true);
      expect(isToday(todayEvening)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = '2026-01-30T10:00:00Z';
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = '2026-02-01T10:00:00Z';
      expect(isToday(tomorrow)).toBe(false);
    });
  });

  describe('isTomorrow', () => {
    it('should return true for tomorrow dates', () => {
      const tomorrowMorning = '2026-02-01T06:00:00Z';
      const tomorrowEvening = '2026-02-01T22:00:00Z';
      expect(isTomorrow(tomorrowMorning)).toBe(true);
      expect(isTomorrow(tomorrowEvening)).toBe(true);
    });

    it('should return false for today', () => {
      const today = '2026-01-31T10:00:00Z';
      expect(isTomorrow(today)).toBe(false);
    });

    it('should return false for day after tomorrow', () => {
      const dayAfterTomorrow = '2026-02-02T10:00:00Z';
      expect(isTomorrow(dayAfterTomorrow)).toBe(false);
    });
  });
});
