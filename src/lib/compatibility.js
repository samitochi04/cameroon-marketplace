// Library compatibility fixes for production builds
// This should be imported before any other libraries

// Prevent libraries from trying to assign to read-only properties
const originalDefineProperty = Object.defineProperty;
Object.defineProperty = function(obj, prop, descriptor) {
  try {
    // If it's trying to set a read-only property on window, ignore it
    if (obj === window && descriptor && descriptor.writable === false) {
      console.warn(`Ignoring read-only property assignment: ${prop}`);
      return obj;
    }
    return originalDefineProperty.call(this, obj, prop, descriptor);
  } catch (error) {
    console.warn(`Property definition failed for ${prop}:`, error);
    return obj;
  }
};

// Override global assignments
const createSafeGlobal = () => {
  const g = (() => {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof window !== 'undefined') return window;
    if (typeof global !== 'undefined') return global;
    if (typeof self !== 'undefined') return self;
    return {};
  })();
  
  return new Proxy(g, {
    set(target, prop, value) {
      try {
        target[prop] = value;
        return true;
      } catch (error) {
        console.warn(`Cannot set global property ${String(prop)}:`, error);
        return true; // Pretend it worked
      }
    }
  });
};

// Set up safe global
if (typeof window !== 'undefined') {
  try {
    window.global = createSafeGlobal();
  } catch (e) {
    console.warn('Could not set window.global:', e);
  }
}

// Export for potential use
export default createSafeGlobal();