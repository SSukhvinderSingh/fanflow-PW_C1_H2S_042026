import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mocking MatchMedia (used for system dark mode checks)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mocking Google Maps SDK
global.google = {
  maps: {
    LatLng: vi.fn(),
    Point: vi.fn(),
    SymbolPath: {
      CIRCLE: 0
    },
    TravelMode: {
      WALKING: 'WALKING',
      TRANSIT: 'TRANSIT',
      DRIVING: 'DRIVING'
    }
  }
};

// Mocking @react-google-maps/api
vi.mock('@react-google-maps/api', () => ({
  GoogleMap: ({ children }) => <div data-testid="google-map">{children}</div>,
  DirectionsService: () => null,
  DirectionsRenderer: () => null,
  Marker: () => null,
  HeatmapLayer: () => null,
  useJsApiLoader: () => ({ isLoaded: true, loadError: null }),
}));

// Mocking Firebase SDKs
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null); // Default to no user
    return () => {};
  }),
}));

vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(),
  ref: vi.fn(),
  onValue: vi.fn((ref, callback) => {
    callback({ val: () => null });
    return () => {};
  }),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  onSnapshot: vi.fn(() => () => {}),
  query: vi.fn(),
  where: vi.fn(),
  serverTimestamp: vi.fn(),
}));
