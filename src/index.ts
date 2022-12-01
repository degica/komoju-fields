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
