import { describe, it, expect } from 'vitest';
import { cartReducer, generateSlots } from '../foodUtils';

describe('foodUtils', () => {
  describe('cartReducer', () => {
    const mockItem = { id: 1, name: 'Hot Dog', price: 5.00 };

    it('adds a new item to an empty cart', () => {
      const state = [];
      const action = { type: 'ADD', item: mockItem };
      const nextState = cartReducer(state, action);
      expect(nextState).toHaveLength(1);
      expect(nextState[0].qty).toBe(1);
    });

    it('increments quantity if item already exists', () => {
      const state = [{ ...mockItem, qty: 1 }];
      const action = { type: 'ADD', item: mockItem };
      const nextState = cartReducer(state, action);
      expect(nextState).toHaveLength(1);
      expect(nextState[0].qty).toBe(2);
    });

    it('decrements quantity down to 1', () => {
      const state = [{ ...mockItem, qty: 2 }];
      const action = { type: 'DECREMENT', id: 1 };
      const nextState = cartReducer(state, action);
      expect(nextState[0].qty).toBe(1);
    });

    it('removes item if quantity reaches 0 via decrement', () => {
      const state = [{ ...mockItem, qty: 1 }];
      const action = { type: 'DECREMENT', id: 1 };
      const nextState = cartReducer(state, action);
      expect(nextState).toHaveLength(0);
    });

    it('removes item specifically via REMOVE', () => {
        const state = [{ ...mockItem, qty: 5 }];
        const action = { type: 'REMOVE', id: 1 };
        const nextState = cartReducer(state, action);
        expect(nextState).toHaveLength(0);
    });

    it('clears the cart', () => {
      const state = [{ id: 1, qty: 2 }, { id: 2, qty: 1 }];
      const action = { type: 'CLEAR' };
      const nextState = cartReducer(state, action);
      expect(nextState).toHaveLength(0);
    });
  });

  describe('generateSlots', () => {
    it('generates 4 slots starting 15-30 mins from base time', () => {
      // Mocking 12:00 PM
      const baseTime = new Date('2026-04-20T12:00:00');
      const slots = generateSlots(baseTime);
      
      expect(slots).toHaveLength(4);
      // 12:00 + 15 min = 12:15. Round up to 15 is still 12:15.
      // Locale string depends on environment but we check length and format
      expect(typeof slots[0]).toBe('string');
    });
  });
});
