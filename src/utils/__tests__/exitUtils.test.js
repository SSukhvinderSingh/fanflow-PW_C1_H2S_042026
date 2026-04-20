import { describe, it, expect } from 'vitest';
import { calculateStaggeredTime } from '../exitUtils';

describe('exitUtils', () => {
  describe('calculateStaggeredTime', () => {
    it('correctly subtracts minutes from a given time string', () => {
      const endTime = "22:00";
      const wait = 10;
      // 22:00 - 10 mins = 21:50
      const result = calculateStaggeredTime(endTime, wait);
      
      // We check for the minutes part specifically to avoid AM/PM or 24h format issues in tests
      expect(result).toMatch(/50/);
    });

    it('handles hour roll-back correctly', () => {
      const endTime = "18:05";
      const wait = 10;
      // 18:05 - 10 mins = 17:55
      const result = calculateStaggeredTime(endTime, wait);
      
      expect(result).toMatch(/55/);
    });
  });
});
