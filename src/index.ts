import './types.d';
import KomojuFieldsElement from './komoju-fields-element';
import KomojuPickerElement from './komoju-picker-element';
import KomojuErrorElement from './shared/komoju-error-element';
import KomojuI18nElement from './shared/komoju-i18n-element';
import KomojuFadeElement from './shared/komoju-fade-element';
declare let window: WindowWithKomojuGlobals;

// Set default language based on browser
window.komojuLanguage = navigator.language.substring(0, 2);

// Public custom elements
window.customElements.define('komoju-fields', KomojuFieldsElement);
window.customElements.define('komoju-picker', KomojuPickerElement);

// "Internal" custom elements
window.customElements.define('komoju-error', KomojuErrorElement);
window.customElements.define('komoju-i18n', KomojuI18nElement);
window.customElements.define('komoju-fade', KomojuFadeElement);

// Error reporting
window.komojuReportError = (error, context) => {
  console.error(error, context);
}
if (window.komojuErrorReporting !== false) {
  // Import proper error reporting module (Honeybadger) if implementer hasn't disabled it
  (async () => {
    // HACK: unnecessary interpolation because of typescript not knowing the type of the import
    // This is a dynamic import because it means implementers who don't want it can opt out of
    // a very large chunk of JS.
    const moduleName = 'error-reporting';
    const module = await import(`/extras/${moduleName}/module.js`);
    window.komojuReportError = module.reportError;
  })();

  // Catch errors (only ones that involve KomojuFields)
  const onerror = (event: ErrorEvent | PromiseRejectionEvent) => {
    const komojuFieldsFiles = [
      /\/fields\.js:\d+:\d+\n/,
      /\/fields\/[\w-]+\/module\.js\n:\d+:\d+/,
      /\/extras\/[\w-]+\/module\.js\n:\d+:\d+/,
    ];

    const error = (event instanceof ErrorEvent) ? event.error : (event.reason as Error);

    if (!(error instanceof Error)) return;
    if (!error.stack) return;
    if (!komojuFieldsFiles.find((regex) => regex.test(error.stack!))) return;

    window.komojuReportError(error);
  };

  window.addEventListener('error', onerror);
  window.addEventListener('unhandledrejection', onerror);
}
