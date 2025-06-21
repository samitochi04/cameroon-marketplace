// Global polyfill for production builds
// This fixes the "Cannot assign to read only property 'undefined'" error

if (typeof global === 'undefined') {
  var global = globalThis;
}

// Ensure process.env exists
if (typeof process === 'undefined') {
  var process = { env: {} };
}

// Additional polyfills for common Node.js globals
if (typeof Buffer === 'undefined') {
  window.Buffer = window.Buffer || {};
}

export default {};