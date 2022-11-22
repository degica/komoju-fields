import './types.d';
import template from './picker.html';
import { registerMessages } from './shared/translations';

declare let window: WindowWithKomojuGlobals;

export default class KomojuPickerElement extends HTMLElement {
  // Attribute: fields
  // DOM ID of <komoju-fields> element that this picker is associated with.
  // When blank, will just update all <komoju-fields> elements.
  get fields() {
    return this.getAttribute('fields');
  }
  set fields(value) {
    this.setAttribute('fields', value ?? '');
  }

  komojuPaymentMethods?: Array<KomojuPaymentMethodMeta>

  // This picker element piggy-backs on the <komoju-fields> element's session.
  // TODO supporting multiple is completely unnecessary. Let's just support one.
  sessionChangedHandler: {
    element: KomojuFieldsConfig,
    handler: (event: Event) => void,
  } | null = null

  constructor() {
    super();
    const root = this.attachShadow({mode: window.komojuFieldsDebug ? 'open' : 'closed'});
    root.innerHTML = template;
  }

  async connectedCallback() {
    const fields = this.komojuFieldsElement();
    const handler = {
      element: fields,
      handler: (_event: Event) => { this.render(fields); },
    };

    await this.setupPaymentTypesI18n();
    this.render(fields);
    fields.addEventListener('komoju-session-change', handler.handler);
  }

  disconnectedCallback() {
    if (this.sessionChangedHandler) {
      this.sessionChangedHandler.element.removeEventListener(
        'komoju-session-change',
        this.sessionChangedHandler.handler
      );
    }
  }

  komojuFieldsElement() {
    if (this.fields) {
      return document.querySelector(`#${this.fields}`) as KomojuFieldsConfig;
    }
    else {
      return document.querySelector('komoju-fields') as KomojuFieldsConfig;
    }
  }

  render(fields: KomojuFieldsConfig) {
    if (!fields.session) return;

    const picker = this.shadowRoot?.getElementById('picker');
    const template = this.shadowRoot?.getElementById('radio-template') as HTMLTemplateElement;
    if (!picker) throw new Error('KOMOJU Fields bug: <komoju-picker> wrong shadow DOM (no picker)');
    if (!template) throw new Error('KOMOJU Fields bug: <komoju-picker> wrong shadow DOM (no template)');

    // Clear the picker.
    picker.replaceChildren();

    let i = 0;
    for (const paymentMethod of fields.session.payment_methods) {
      const radio = template.content.cloneNode(true) as HTMLElement;
      const input = radio.querySelector('input') as HTMLInputElement;
      const icon = radio.querySelector('img') as HTMLImageElement;
      const text = radio.querySelector('komoju-i18n') as KomojuI18nElement;

      if (i === 0 || fields.paymentType === paymentMethod.type) {
        input.checked = true;
      }
      input.addEventListener('change', () => {
        fields.paymentType = paymentMethod.type;
      });

      icon.src = `${fields.komojuApi}/payment_methods/${paymentMethod.type}.svg`;
      text.key = paymentMethod.type;

      picker.append(radio);

      i += 1;
    }
  }

  // To keep things dynamic, we pull payment method translations from KOMOJU.
  private async setupPaymentTypesI18n() {
    const fields = this.komojuFieldsElement();
    const response = await fields.komojuFetch('GET', '/api/v1/payment_methods');
    this.komojuPaymentMethods = await response.json();

    // Convert the "name_en", "name_ja" etc into { "en": { "<name>": "<string>" } }.
    for (const method of this.komojuPaymentMethods!) {
      const i18n = {
        en: { [method.type_slug]: method.name_en },
        ja: { [method.type_slug]: method.name_ja },
        ko: { [method.type_slug]: method.name_ko },
      };
      registerMessages(i18n);
    }
  }
}
