import '../../types.d'
import html from './template.html'
import { convertNumbersToHalfWidth } from '../../shared/char-width-utils';
import { addValidation } from '../../shared/validation';
import * as i18n from './i18n';
import {
  cardType,
  formatCardNumber,
  cardNumberMaxLength,
  cardTypeToKomojuSubtype,
  luhnCheck,
} from './card-number-utils';

export const render: KomojuRenderFunction = (root, _paymentMethod) => {
  root.innerHTML = html;
  initializeInputs(root, root.host as KomojuFieldsConfig);
}

function initializeInputs(document: DocumentFragment, config: KomojuFieldsConfig) {
  // Translate labels
  document.querySelectorAll('.translated').forEach((span) => {
    if (!span.textContent) return;
    const key = span.textContent;
    if (!(key in i18n.en)) throw new Error(`BUG: invalid translation key ${String(key)}`);
    span.textContent = config.t(i18n, key as keyof typeof i18n.en);
  });

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
  addValidation(name, (input) => {
    if (input.value === '') return config.t(i18n, 'error.required');
    return null;
  });

  // Credit card number
  const number = document.getElementById('cc-number')! as HTMLInputElement;
  const defaultCardImage = `url(${config.komojuCdn}/static/credit_card_number.svg)`
  number.style.backgroundImage = defaultCardImage;

  // Card number format: 1234 5678 9012 3456 (sometimes more or less digits)
  number.addEventListener('input', (event) => {
    const input = event.target as HTMLInputElement;
    if (input.dataset.ime === 'active') return;
    let value = input.value;

    value = convertNumbersToHalfWidth(value).replace(/\D/g, '');

    const type = cardType(value);

    input.maxLength = cardNumberMaxLength(type);
    input.value = formatCardNumber(value, type);
    input.dataset.brand = type;

    const brand = cardTypeToKomojuSubtype(type);
    input.style.backgroundImage = type === 'unknown' ?  defaultCardImage :
      `url(https://komoju.com/payment_methods/credit_card.svg?brands=${brand})`;
  });

  // Card number validation: luhn check
  addValidation(number, (input) => {
    const value = input.value.replace(/\D/g, '');
    if (value === '') return config.t(i18n, 'error.required');
    if (!luhnCheck(value)) return config.t(i18n, 'error.invalid-number');
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
  addValidation(exp, (input) => {
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
      return config.t(i18n, 'error.incomplete');
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
      return config.t(i18n, 'error.expired');
    }

    // Complain if month is in the past
    if (yearNum === currentYear && monthNum < currentMonth) {
      return config.t(i18n, 'error.expired');
    }

    // Complain if month is past December
    if (monthNum > 12 || monthNum <= 0) {
      return config.t(i18n, 'error.invalid-month');
    }

    return null;
  });

  // CVC
  // Here we just want to set the helper image.
  const cvc = document.getElementById('cc-cvc')! as HTMLInputElement;
  cvc.style.backgroundImage = `url(${config.komojuCdn}/static/credit_card_cvc.svg)`;

  // CVC validation: just make sure it's not empty
  addValidation(cvc, (input) => {
    if (input.value === '') return config.t(i18n, 'error.required');
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
