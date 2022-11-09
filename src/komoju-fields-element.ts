import './types.d'

export default class KomojuFieldsElement extends HTMLElement {
  static get observedAttributes() {
    return [
      'session-id',
      'publishable-key',
      'komoju-api',
      'komoju-cdn',
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

  /*
    TODO:
    1. get session from ID
    2. based on payment types, dynamic-import the appropriate fields
    3. render the fields

    Also we need to figure out how to configure both komoju.com and multipay.komoju.com endpoints.
  */

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
        // TODO: maybe call a render function here?
      }, 0);
    }
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
