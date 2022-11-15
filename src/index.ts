import './types.d';
import KomojuFieldsElement from './komoju-fields-element';
import KomojuErrorElement from './shared/komoju-error-element';
import KomojuI18nElement from './shared/komoju-i18n-element';
import KomojuFadeElement from './shared/komoju-fade-element';
declare let window: WindowWithKomojuTranslations;

// Set up i18n
window.komojuLanguage = navigator.language.substring(0, 2);
window.komojuTranslations = { 'en': {}, 'ja': {} };

// Public custom elements
window.customElements.define('komoju-fields', KomojuFieldsElement);

// "Internal" custom elements
window.customElements.define('komoju-error', KomojuErrorElement);
window.customElements.define('komoju-i18n', KomojuI18nElement);
window.customElements.define('komoju-fade', KomojuFadeElement);
