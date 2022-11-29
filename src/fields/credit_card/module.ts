import KomojuFieldIconElement from './komoju-field-icon-element';
import html from './template.html'
import { convertNumbersToHalfWidth } from '../../shared/char-width-utils';
import { addValidation } from '../../shared/validation';
import {
  cardType,
  formatCardNumber,
  cardNumberMaxLength,
  cardTypeToKomojuSubtype,
  luhnCheck,
} from './card-number-utils';

import { registerMessages } from '../../shared/translations';
import * as i18n from './i18n';
registerMessages(i18n);

window.customElements.define('komoju-field-icon', KomojuFieldIconElement);

export const render: KomojuRenderFunction = (root, _paymentMethod) => {
  root.innerHTML = html;
  initializeInputs(root, root.host as KomojuFieldsConfig);
}

function initializeInputs(document: DocumentFragment, config: KomojuFieldsConfig) {
  // So, IME. We don't want to do auto-formatting while IME is active.
  document.querySelectorAll('input').forEach((input) => {
    input.addEventListener('compositionstart', () => {
      input.dataset.ime = 'active';
    });
    input.addEventListener('compositionend', () => {
      input.dataset.ime = 'inactive';
    });
  });

  // Card holder name validation: just make sure it's not empty
  const name = document.getElementById('cc-name')! as HTMLInputElement;
  addValidation(i18n, name, (input) => {
    if (input.value === '') return 'cc.error.required';
    return null;
  });

  // Card number icon
  const cardIcon = document.getElementById('cc-icon')! as KomojuFieldIconElement;
  const defaultCardImage = `${config.komojuCdn}/static/credit_card_number.svg`;

  // TODO: get brands from config
  const supportedBrandImages = ['visa', 'master', 'jcb'].map((brand) => {
    return `https://komoju.com/payment_methods/credit_card.svg?brands=${brand}`;
  }).join(' ');
  cardIcon.icon = supportedBrandImages;

  // Card number format: 1234 5678 9012 3456 (sometimes more or less digits)
  const number = document.getElementById('cc-number')! as HTMLInputElement;
  number.addEventListener('input', (event) => {
    const input = event.target as HTMLInputElement;
    if (input.dataset.ime === 'active') return;
    let value = input.value;

    value = convertNumbersToHalfWidth(value).replace(/\D/g, '');

    const type = cardType(value);

    input.maxLength = cardNumberMaxLength(type);
    input.value = formatCardNumber(value, type);
    input.dataset.brand = type;

    // Update the card icons based on detected brand
    const brand = cardTypeToKomojuSubtype(type);
    if (type === 'unknown') {
      // Most brands are identifiable after 3 characters
      if (value.length < 3) {
        cardIcon.icon = supportedBrandImages;
      } else {
        cardIcon.icon = defaultCardImage;
      }
    }
    else {
      cardIcon.icon = `https://komoju.com/payment_methods/credit_card.svg?brands=${brand}`;
    }
  });

  // Card number validation: luhn check
  addValidation(i18n, number, (input) => {
    const value = input.value.replace(/\D/g, '');
    if (value === '') return 'cc.error.required';
    if (!luhnCheck(value)) return 'cc.error.invalid-number';
    return null;
  });

  // Expiration date
  // Format: MM / YY. We automatically insert the slash.
  const exp = document.getElementById('cc-exp')! as HTMLInputElement;
  let lastExpValue = exp.value;
  exp.addEventListener('input', (event) => {
    const input = event.target as HTMLInputElement;
    if (input.dataset.ime === 'active') return;

    let value = input.value;
    const addedNewCharacter = value.length > lastExpValue.length;

    // Remove non-digits
    value = convertNumbersToHalfWidth(value);
    value = value.replace(/[^0-9( \/ )]+/g, '');

    // Insert "/" after first 2 digits (but only on _new input_, not on backspace)
    const hasSlash = value.includes(' / ');
    const hasFullMonth = value.length >= 2;
    if (addedNewCharacter && hasFullMonth && !hasSlash) {
      let yearStart = value.lastIndexOf(' ');
      if (yearStart === -1) yearStart = 3;

      const month = value.slice(0, 2);
      const year = value.slice(yearStart, value.length);
      value = `${month} / ${year}`;
    }
    // Remove slash if the user starts backspacing it
    else if (!addedNewCharacter && value.endsWith('/')) {
      value = value.replace(/[^0-9]+/g, '');
    }

    input.value = value;
    lastExpValue = value;
  });

  // Expiration validation: format and date
  addValidation(i18n, exp, (input) => {
    const mmyy = input.value.replace(/[^0-9\/]/g, '');
    const [month, year] = mmyy.split('/');

    // Complain about incomplete expiration
    if (
      month == null ||
      year == null ||
      year.length !== 2 ||
      month.length !== 2 ||
      !/^\d{2}\/\d{2}$/.test(mmyy)
    ) {
      return 'cc.error.incomplete';
    }

    const now = new Date();
    const currentYear = parseInt(
      now
        .getFullYear()
        .toString()
        .substr(2, 2)
    );
    const currentMonth = now.getMonth() + 1;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Complain if year is in the past
    if (yearNum < currentYear) {
      return 'cc.error.expired';
    }

    // Complain if month is in the past
    if (yearNum === currentYear && monthNum < currentMonth) {
      return 'cc.error.expired';
    }

    // Complain if month is past December
    if (monthNum > 12 || monthNum <= 0) {
      return 'cc.error.invalid-month';
    }

    return null;
  });

  // CVC
  // Here we just want to set the helper image.
  const cvcIcon = document.getElementById('cc-cvc-icon')! as KomojuFieldIconElement;
  cvcIcon.icon = `${config.komojuCdn}/static/credit_card_cvc.svg`;

  // CVC validation: just make sure it's not empty
  const cvc = document.getElementById('cc-cvc')! as HTMLInputElement;
  addValidation(i18n, cvc, (input) => {
    if (input.value === '') return 'cc.error.required';
    return null;
  });
}

export const paymentDetails: KomojuPaymentDetailsFunction = (root, _paymentMethod) => {
  const name = root.getElementById('cc-name') as HTMLInputElement;
  const number = root.getElementById('cc-number') as HTMLInputElement;
  const expiration = root.getElementById('cc-exp') as HTMLInputElement;
  const cvc = root.getElementById('cc-cvc') as HTMLInputElement;

  const [month, year] = expiration.value.split('/').map(s => s.trim());

  return {
    type: 'credit_card',
    name: name.value,
    number: number.value,
    month, year,
    verification_value: cvc.value,
  }
}
