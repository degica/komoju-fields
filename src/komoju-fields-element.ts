import './types.d'
import spinner from './spinner.html'

export default class KomojuFieldsElement extends HTMLElement {
  static get observedAttributes() {
    return [
      'session-id',
      'payment-type',
    ];
  }

  session: KomojuSession | null = null

  get komojuApi() {
    const value = this.getAttribute('komoju-api');
    if (!value || value === '') return 'https://komoju.com';
    else return value;
  }
  set komojuApi(value) {
    this.setAttribute('komoju-api', value ?? '');
  }

  get komojuCdn() {
    const value = this.getAttribute('komoju-cdn');
    if (!value || value === '') return 'https://multipay.komoju.com';
    else return value;
  }
  set komojuCdn(value) {
    this.setAttribute('komoju-cdn', value ?? '');
  }

  get sessionId() {
    return this.getAttribute('session-id');
  }
  set sessionId(value) {
    this.setAttribute('session-id', value ?? '');
  }

  get publishableKey() {
    return this.getAttribute('publishable-key');
  }
  set publishableKey(value) {
    this.setAttribute('publishable-key', value ?? '');
  }

  get paymentType() {
    return this.getAttribute('payment-type');
  }
  set paymentType(value) {
    this.setAttribute('payment-type', value ?? '');
  }

  constructor() {
    super();
    const root = this.attachShadow({mode: 'open'});
    root.innerHTML = spinner;
  }

  attributeChangedCallback(name: string, _oldValue: any, newValue: any) {
    if (name === 'session-id' && typeof newValue === 'string' && newValue != '') {
      // Just in case publishable-key is set before session-id, we fetch the session on next tick.
      setTimeout(async () => {
        const response = await this.komojuFetch('GET', `/api/v1/sessions/${newValue}`);

        if (response.status === 404) {
          console.error('Invalid KOMOJU session', newValue);
          return;
        }

        if (response.status !== 200) {
          console.error('Failed to retrieve KOMOJU session', response);
          return;
        }

        this.session = await response.json();
        if (!this.session) throw new Error('KOMOJU returned a null session');
        if (!this.paymentType) this.paymentType = this.session.payment_methods[0].type;

        this.render();
      }, 0);
    }
    else if (name === 'payment-type') {
      this.render();
    }
  }

  async render() {
    if (!this.session) throw new Error('KOMOJU Session not loaded');
    const paymentMethod = this.session.payment_methods.find(method => method.type === this.paymentType);
    if (!paymentMethod) throw new Error(`KOMOJU Payment method not found: ${this.paymentType}`);

    const module = await import(`${this.komojuCdn}/fields/${this.paymentType}/module.js`);
    module.default(this.shadowRoot, paymentMethod);
  }

  private komojuFetch(method: 'GET' | 'POST', path: string): Promise<Response> {
    return fetch(`${this.komojuApi}${path}`, {
      method,
      headers: {
        authorization: `Basic ${btoa(`${this.publishableKey}:`)}`
      }
    });
  }
}
