import KomojuFieldsElement from './komoju-fields-element';
import KomojuErrorElement from './shared/komoju-error-element';

// Public custom elements
window.customElements.define('komoju-fields', KomojuFieldsElement);

// "Internal" custom elements
window.customElements.define('komoju-error', KomojuErrorElement);
