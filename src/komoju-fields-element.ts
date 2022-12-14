import spinner from './spinner.html'
import { runValidation } from './shared/validation'
import KomojuI18nElement from './shared/komoju-i18n-element';
import { formatMoney } from './money';
import ENV from './generated/env';

import { registerMessages } from './shared/translations';
import * as i18n from './i18n';
registerMessages(i18n);

// Language gets stored in here, mostly controlled by <komoju-fields>.
declare let window: WindowWithKomojuGlobals;

export default class KomojuFieldsElement extends HTMLElement implements KomojuFieldsConfig {
  static get observedAttributes() {
    return [
      'session',
      'session-id',
      'payment-type',
      'locale',
      'theme',
    ];
  }

  // 'session' is also an attribute. Set the 'session' attribute to a stringified JSON of
  // the entire KOMOJU sesion to skip having to fetch it from KOMOJU again.
  _session: KomojuSession | null = null
  get session() {
    return this._session;
  }
  set session(value) {
    this._session = value;
    this.dispatchEvent(new CustomEvent('komoju-session-change', {
      detail: { session: this._session }, bubbles: true, composed: true, cancelable: false
    }));
  }

  module: {
    render: KomojuRenderFunction,
    paymentDetails: KomojuPaymentDetailsFunction
  } | null = null

  // When a <komoju-fields> element appears inside of a <form> tag,
  // we attach a submit handler to it.
  // This keeps track of that handler and lets us remove it when disconnected.
  formSubmitHandler?: {
    form: HTMLFormElement,
    target: HTMLElement, // target is different from form so we can ensure our event gets called first
    handler: (event: Event) => void
  }

  // Attribute: komoju-api
  // Usually this'll just be https://komoju.com, but sometimes we use other URLs.
  get komojuApi() {
    const value = this.getAttribute('komoju-api');
    if (!value || value === '') return 'https://komoju.com';
    else return value;
  }
  set komojuApi(value) {
    this.setAttribute('komoju-api', value ?? '');
  }

  // Attribute: session-id
  // KOMOJU Session ID. Create your session on the server then pass it in here.
  get sessionId() {
    return this.getAttribute('session-id');
  }
  set sessionId(value) {
    this.setAttribute('session-id', value ?? '');
  }

  // Attribute: publishable-key
  // KOMOJU publishable key. Get this from your merchant dashboard.
  get publishableKey() {
    return this.getAttribute('publishable-key');
  }
  set publishableKey(value) {
    this.setAttribute('publishable-key', value ?? '');
  }

  // Attribute: payment-type
  // Which payment type to show. If your session only has 1 payment type, this is unnecessary.
  // Alternatively, if a <komoju-picker> element is present, this will be set automatically.
  get paymentType() {
    return this.getAttribute('payment-type');
  }
  set paymentType(value) {
    this.setAttribute('payment-type', value ?? '');
  }

  // Attribute: locale
  // Language of text to show. Defaults to the browser's language.
  get locale() {
    return this.getAttribute('locale');
  }
  set locale(value) {
    this.setAttribute('locale', value ?? '');
  }

  // Attribute: theme
  // CSS file to use as a theme.
  get theme() {
    return this.getAttribute('theme');
  }
  set theme(value) {
    this.setAttribute('theme', value ?? '');
  }

  // Attribute: token
  // Boolean attribute - if present, will generate a token instead of processing payment.
  get token() {
    return this.hasAttribute('token');
  }
  set token(value) {
    if (value) this.setAttribute('token', '');
    else this.removeAttribute('token');
  }

  // Attribute: name
  // Similar to an input's name attribute. This is used in token mode, and is the name of the
  // input that will contain the token.
  get name() {
    return this.getAttribute('name');
  }
  set name(value) {
    if (value) this.setAttribute('name', value);
    else this.removeAttribute('name');
  }

  // Where to fetch payment method modules.
  get komojuCdn() {
    return ENV['CDN'];
  }

  get paymentMethod() {
    return this.session?.payment_methods.find(method => method.type === this.paymentType);
  }

  // We start by just showing a spinner.
  constructor() {
    super();
    const root = this.attachShadow({mode: ENV['ENV'] === 'development' ? 'open' : 'closed'});
    root.innerHTML = spinner;
  }

  // Reactive attribute handling. When session or payment type is changed, we want to re-render.
  async attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
    if (name === 'session') {
      if (!newValue || newValue == '') return;

      this.session = JSON.parse(newValue);
      window.komojuLanguage = this.session!.default_locale.substring(0, 2);
      if (!this.paymentType) this.paymentType = this.session!.payment_methods[0].type;
      this.render();
    } else if (name === 'session-id') {
      if (!newValue || newValue == '') return;

      // Just in case publishable-key is set before session-id, we fetch the session on next tick.
      setTimeout(async () => {
        const response = await this.komojuFetch('GET', `/api/v1/sessions/${newValue}`);

        if (response.status === 404) {
          console.error('Invalid KOMOJU session ID', newValue);
          return;
        }

        if (response.status !== 200) {
          console.error('Failed to retrieve KOMOJU session', response);
          return;
        }

        this.session = await response.json();
        if (!this.session) throw new Error('KOMOJU returned a null session');
        if (!this.paymentType) this.paymentType = this.session.payment_methods[0].type;
        window.komojuLanguage = this.session.default_locale.substring(0, 2);

        this.render();
      }, 0);
    }
    else if (name === 'payment-type') {
      if (!newValue || newValue == '') return;
      if (!this.session) return;

      let done = false;
      // Showing spinner right away is ugly when the payment method loads
      // fast, so we only show spinner if it takes more than 100ms.
      setTimeout(
        () => { if (!done) this.shadowRoot!.innerHTML = spinner },
        100
      );
      await this.render();
      done = true;
    }
    else if (name === 'locale') {
      if (!newValue || newValue == '') return;

      window.komojuLanguage = newValue.substring(0, 2);
      const renderI18n = (el: Element) => (el as KomojuI18nElement).render();

      document.querySelectorAll('komoju-i18n').forEach(renderI18n);
      document.querySelectorAll('komoju-picker').forEach(picker =>
        picker.shadowRoot?.querySelectorAll('komoju-i18n').forEach(renderI18n)
      );
      if (!this.shadowRoot) return;
      this.shadowRoot.querySelectorAll('komoju-i18n').forEach(renderI18n);
    }
    else if (name === 'theme') {
      if (!this.shadowRoot) return;
      this.shadowRoot.querySelectorAll('#theme').forEach(link => link.remove());
      this.applyTheme(newValue);
    }
  }

  // When connected, we want to find the form that this element is in and attach a submit handler to it.
  connectedCallback() {
    // Crudely search for parent element until it is a form tag.
    let parent = this.parentElement;
    while (parent && parent.tagName !== 'FORM') {
      parent = parent.parentElement;
    }
    // It's OK if we can't find a parent form tag.
    // Implementers can call submit() manually on this element.
    if (!parent) return;
    const form = parent as HTMLFormElement;

    // We set the event target to the form's parent to ensure that our handler is called first.
    // This works because of capturing. Capturing events are called on parents *before* target.
    const target = form.parentElement;
    if (!target) return;

    const handler = (event: Event) => {
      // Make sure this komoju-fields element is visible.
      if (this.offsetParent === null) return;
      // Make sure this event is for the right form element.
      if (event.target !== form) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      this.submit(event);
    };
    target.addEventListener('submit', handler, true);
    this.formSubmitHandler = { form, target, handler };
  }

  // When disconnected, we want to remove the submit handler from the form (if added).
  disconnectedCallback() {
    if (!this.formSubmitHandler) return;
    this.formSubmitHandler.target.removeEventListener('submit', this.formSubmitHandler.handler, true);
    this.formSubmitHandler = undefined;
  }

  // Submits payment details securely to KOMOJU before redirecting.
  // The redirect target may be
  // 1. A URL for performing 3DS authentication
  // 2. An external payment provider URL (i.e. to log into a payment app or show a QR code)
  // 3. The session's return_url in the case where payment is completed instantly
  async submit(event?: Event): Promise<KomojuToken | void> {
    if (!this.module || !this.shadowRoot || !this.session) {
      throw new Error('Attempted to submit before selecting KOMOJU Payment method');
    }
    const paymentMethod = this.session.payment_methods.find(method => method.type === this.paymentType);
    if (!paymentMethod) throw new Error(`KOMOJU Payment method not found: ${this.paymentType}`);

    // Check for invalid input
    this.shadowRoot.querySelectorAll('komoju-error').forEach(error => error.remove());
    const validatedFields = this.shadowRoot.querySelectorAll('.has-validation');
    const errors = Array.prototype.map.call(validatedFields, (field) =>
      field instanceof HTMLInputElement ? runValidation(field) : null
    );
    if (errors.some(error => error != null)) {
      // Emit an event so implementers can handle this.
      this.dispatchEvent(new CustomEvent('komoju-invalid', {
        detail: { errors }, bubbles: true, composed: true,
      }));

      return;
    }

    // Now we can pull the payment details hash from the payment method module
    // and send it to KOMOJU.
    this.startFade();
    const paymentDetails = this.module.paymentDetails(this.shadowRoot, paymentMethod);

    if (this.token) {
      return await this.submitToken(paymentDetails, event);
    }
    else {
      return await this.submitPayment(paymentDetails);
    }
  }

  // Called by submit,
  // submits payment directly to KOMOJU for processing.
  async submitPayment(paymentDetails: object) {
    if (!this.shadowRoot || !this.session) {
      throw new Error('Attempted to submit before selecting KOMOJU Payment method');
    }

    const payResponse = await this.komojuFetch('POST', `/api/v1/sessions/${this.session.id}/pay`, {
      payment_details: paymentDetails
    });
    const payResult = await payResponse.json() as KomojuPayResult;

    if (payResult.error) {
      console.error(payResult);
      this.handleApiError(payResult.error);
      this.endFade();
      return;
    }

    window.location.href = payResult.redirect_url!;
  }

  handleApiError(error: string | KomojuApiError) {
    if (!this.shadowRoot) {
      throw new Error('KOMOJU Fields bug: no shadow root on error');
    }

    // Emit an event so implementers can handle this.
    const showError = this.dispatchEvent(new CustomEvent('komoju-error', {
      detail: { error }, bubbles: true, composed: true, cancelable: true,
    }));

    // Show errors if implementers don't cancel the event.
    if (!showError) return;

    this.shadowRoot.querySelectorAll('.generic-error-message').forEach(container => {
      const errorText = document.createElement('komoju-error');
      if (typeof error === 'string') {
        errorText.textContent = error;
      } else if (error.message) {
        errorText.textContent = error.message;
      }
      container.append(errorText);
    });
  }

  // Called by submit,
  // uses payment info to create a token that can be safely transmitted to the backend and used there.
  async submitToken(paymentDetails: object, event?: Event) {
    if (!this.shadowRoot) {
      throw new Error('KOMOJU Fields bug: no shadow root on submit');
    }

    const tokenResponse = await this.komojuFetch('POST', `/api/v1/tokens`, {
      payment_details: paymentDetails
    });
    if (tokenResponse.status >= 400) {
      const error = (await tokenResponse.json()).error as KomojuApiError;
      this.handleApiError(error);
      this.endFade();
      return;
    }
    const token = await tokenResponse.json() as KomojuToken;

    // If this is part of a form submit, we want to add the token to the form and resubmit.
    if (event && this.formSubmitHandler) {
      const form = this.formSubmitHandler.form;

      // Now we add an input to the form with the token and submit it.
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = this.name ?? 'komoju_token';
      input.value = token.id;
      form.append(input);

      // Re-submit the form.
      console.log('re-submitting!');
      console.log(this);
      console.log(input);
      this.formSubmitHandler.target.removeEventListener('submit', this.formSubmitHandler.handler, true);
      this.formSubmitHandler = undefined;

      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      if (form.dispatchEvent(submitEvent)) {
        form.submit();
      } else {
        this.endFade();
      }
    }

    return token;
  }

  // Renders fields for the selected payment method.
  // Usually implementers would not need to call this manually.
  async render() {
    if (!this.session) throw new Error('KOMOJU Session not loaded');

    const paymentMethod = this.session.payment_methods.find(method => method.type === this.paymentType);
    if (!paymentMethod) throw new Error(`KOMOJU Payment method not found: ${this.paymentType}`);

    // Grab the module for the payment method (name of a folder in src/fields)
    const moduleName = paymentMethod.offsite ? 'offsite' : paymentMethod.type;
    this.module = await import(`${this.komojuCdn}/fields/${moduleName}/module.js`);
    if (!this.module) throw new Error(`KOMOJU Payment module not found: ${this.paymentType}`);

    // Call the module's render function. It will add elements directly to this element's shadow DOM.
    if (!this.shadowRoot) throw new Error('KOMOJU Fields element has no shadow root (internal bug)');
    this.module.render(this.shadowRoot, paymentMethod);

    // Add global styles (src = shared.css)
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${this.komojuCdn}/static/shared.css`;
    this.shadowRoot.prepend(link);

    // Add theme styles
    this.applyTheme(this.theme);

    // Add price info (customer fee, dynamic currency)
    const priceInfo = this.shadowRoot.querySelector('.price-info');
    if (!priceInfo) return;

    // Customer fee
    if (paymentMethod.customer_fee) {
      const listItem = document.createElement('li');
      const feeMessage = document.createElement('komoju-i18n') as KomojuI18nElement;
      listItem.classList.add('customer-fee');
      feeMessage.key = 'customer-fee-will-be-charged';
      feeMessage.dataset['fee'] = formatMoney(
        paymentMethod.customer_fee,
        paymentMethod.currency ?? this.session.currency
      );
      listItem.append(feeMessage);
      priceInfo.append(listItem);
    }

    // Dynamic currency (DCC)
    if (
      paymentMethod.exchange_rate &&
      paymentMethod.amount &&
      paymentMethod.currency &&
      paymentMethod.currency !== this.session.currency
    ) {
      const listItem = document.createElement('li');
      const dccMessage = document.createElement('komoju-i18n') as KomojuI18nElement;
      const rate = Math.round(paymentMethod.exchange_rate * 10000) / 10000;
      dccMessage.key = 'dynamic-currency-notice';
      dccMessage.dataset['currency'] = paymentMethod.currency;
      dccMessage.dataset['original'] = formatMoney(this.session.amount, this.session.currency);
      dccMessage.dataset['converted'] = formatMoney(paymentMethod.amount, paymentMethod.currency);
      if (paymentMethod.customer_fee) {
        dccMessage.key = 'dynamic-currency-notice-with-fee';
        dccMessage.dataset['total'] = formatMoney(
          paymentMethod.amount + paymentMethod.customer_fee,
          paymentMethod.currency
        );
      }
      listItem.title = `1 ${this.session.currency} = ${rate} ${paymentMethod.currency}`;
      listItem.classList.add('dynamic-currency');
      listItem.append(dccMessage);
      priceInfo.append(listItem);
    }
  }

  applyTheme(urlToCSS: string | null) {
    if (!urlToCSS || urlToCSS == '') {
      urlToCSS = `${this.komojuCdn}/static/themes/elements.css`;
    }
    const link = document.createElement('link');
    link.id = 'theme';
    link.rel = 'stylesheet';
    link.href = urlToCSS;
    this.shadowRoot?.append(link);
  }

  // fetch wrapper with KOMOJU authentication already handled.
  komojuFetch(method: 'GET' | 'POST', path: string, body?: object): Promise<Response> {
    return fetch(`${this.komojuApi}${path}`, {
      method,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Basic ${btoa(`${this.publishableKey}:`)}`,
      },
      body: body ? JSON.stringify(body) : undefined
    });
  }

  // Fade out fields while loading
  private startFade() {
    const fade = document.createElement('komoju-fade');
    setTimeout(() => fade.classList.add('show'), 0);
    this.shadowRoot?.querySelector('.fields')?.prepend(fade);
  }

  // Remove the fade effect created by startFade()
  private endFade() {
    this.shadowRoot?.querySelectorAll('komoju-fade').forEach(el => {
      const fade = el as HTMLElement;
      fade.classList.remove('show');
      fade.addEventListener('transitionend', () => fade.remove());
    });
  }
}
