import '../../types.d'
import text from './template.html'
import { convertNumbersToHalfWidth } from '../../shared/char-width-utils';
import { cardType, formatCardNumber, cardNumberMaxLength, cardTypeToKomojuSubtype } from './card-number-utils';

export const render: KomojuRenderFunction = (root, paymentMethod) => {
  root.innerHTML = text;
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

  // Credit card number
  // Format: 1234 5678 9012 3456 (sometimes more or less digits)
  const number = document.getElementById('cc-number')! as HTMLInputElement;
  const defaultCardImage = `url(${config.komojuCdn}/static/credit_card_number.svg)`
  number.style.backgroundImage = defaultCardImage;
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

  // Expiration date
  // Format: MM/YY. We automatically insert the slash.
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

  // CVC
  // Here we just want to set the helper image.
  const cvc = document.getElementById('cc-cvc')! as HTMLInputElement;
  cvc.style.backgroundImage = `url(${config.komojuCdn}/static/credit_card_cvc.svg)`;
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
