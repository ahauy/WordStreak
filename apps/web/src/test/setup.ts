import "@testing-library/jest-dom";

// Polyfill localStorage on Storage.prototype for Node 22+ JSDOM environment
if (typeof window !== "undefined") {
  const store: Record<string, string> = {};

  if (window.Storage && window.Storage.prototype) {
    window.Storage.prototype.getItem = function (key: string) {
      return store[key] ?? null;
    };
    window.Storage.prototype.setItem = function (key: string, value: string) {
      store[key] = String(value);
    };
    window.Storage.prototype.removeItem = function (key: string) {
      delete store[key];
    };
    window.Storage.prototype.clear = function () {
      for (const key of Object.keys(store)) {
        delete store[key];
      }
    };
    window.Storage.prototype.key = function (index: number) {
      return Object.keys(store)[index] ?? null;
    };
    Object.defineProperty(window.Storage.prototype, "length", {
      get: function () {
        return Object.keys(store).length;
      },
      configurable: true,
    });

    const storageInstance = Object.create(window.Storage.prototype);
    Object.defineProperty(window, "localStorage", {
      value: storageInstance,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "localStorage", {
      value: storageInstance,
      writable: true,
      configurable: true,
    });
  }
}

// Mock window.matchMedia
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
