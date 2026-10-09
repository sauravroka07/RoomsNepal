// Polyfill/fix for Chrome extension request interceptors in sandbox/iframe environments
// Some environments define fetch on Window.prototype with only a getter, which causes
// extensions (e.g. requests.js) to throw "TypeError: Cannot set property fetch of #<Window> which has only a getter"
// when executing `window.fetch = ...`.
try {
  if (typeof window !== 'undefined') {
    const origFetch = window.fetch;
    const boundFetch = origFetch ? origFetch.bind(window) : undefined;
    let activeFetch = boundFetch;

    Object.defineProperty(window, 'fetch', {
      configurable: true,
      enumerable: true,
      get() {
        return activeFetch;
      },
      set(fn: any) {
        activeFetch = fn;
      },
    });

    // Suppress external extension errors
    window.addEventListener(
      'error',
      (event: ErrorEvent) => {
        if (
          (event.message && event.message.includes('Cannot set property fetch')) ||
          (event.filename && event.filename.includes('chrome-extension://'))
        ) {
          event.preventDefault();
          event.stopImmediatePropagation();
          return true;
        }
      },
      true
    );
  }
} catch {
  // Silently ignore if descriptor is already locked
}

export {};
