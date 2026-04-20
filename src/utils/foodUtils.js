/**
 * Cart Reducer for Food Ordering
 */
export const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD":
      const existing = state.find(i => i.id === action.item.id);
      if (existing) return state.map(i => i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...action.item, qty: 1 }];
    case "REMOVE":
      return state.filter(i => i.id !== action.id);
    case "DECREMENT":
      const decItem = state.find(i => i.id === action.id);
      if (decItem && decItem.qty > 1) {
        return state.map(i => i.id === action.id ? { ...i, qty: i.qty - 1 } : i);
      }
      return state.filter(i => i.id !== action.id);
    case "CLEAR":
      return [];
    default:
      return state;
  }
};

/**
 * Generate 15-minute pickup slots ahead of current time
 */
export const generateSlots = (baseDate = new Date()) => {
  const slots = [];
  const now = new Date(baseDate.getTime());
  
  // Start options at least 15 min from now
  now.setMinutes(now.getMinutes() + 15);
  // Round up to nearest 15
  const remainder = now.getMinutes() % 15;
  if (remainder !== 0) {
    now.setMinutes(now.getMinutes() + (15 - remainder));
  }

  for (let i = 0; i < 4; i++) {
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    slots.push(timeStr);
    now.setMinutes(now.getMinutes() + 15);
  }
  return slots;
};
