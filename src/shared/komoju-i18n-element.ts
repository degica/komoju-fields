// Language gets stored in here, mostly controlled by <komoju-fields>.
declare let window: WindowWithKomojuGlobals;

// This is a <komoju-i18n> element that we use internally for displaying translated text
export default class KomojuI18nElement extends HTMLElement {
  static get observedAttributes() {
    return ['key'];
  }

  // Attribute: key
  // The key of the translation to display.
  get key() {
    return this.getAttribute('key');
  }
  set key(value) {
    this.setAttribute('key', value ?? '');
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, _oldValue: string, _newValue: string) {
    if (name !== 'key') return;
    this.render();
  }

  render() {
    if (!this.key) return;
    const lang = Object.keys(window.komojuTranslations).includes(window.komojuLanguage)
      ? window.komojuLanguage : 'en';

    const message = window.komojuTranslations[lang][this.key];
    if (!message) {
      console.error(`KOMOJU bug: missing translation for key: ${this.key}`);
      return;
    }

    // Perform interpolation
    const matches = message.match(/%\{[\w-]+\}/g);
    if (matches) {
      let result = message;
      matches.forEach((match) => {
        const key = match.replace(/%{|}/g, '');
        const value = this.dataset[key];
        if (value) result = result.replace(match, value);
      });
      this.textContent = result;
      return;
    }

    this.textContent = message;
  }
}
