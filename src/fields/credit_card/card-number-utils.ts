type CardType = 'visa' | 'mastercard' | 'amex' | 'jcb' | 'jcb15' | 'diner' | 'discover' | 'unionpay' | 'unknown';

export function cardTypeToKomojuSubtype(type: CardType) {
  if (type === 'amex') return 'american_express';
  if (type === 'diner') return 'diners_club';
  if (type === 'jcb15') return 'jcb';
  if (type === 'mastercard') return 'master';
  return type;
}

export function insertSpaceEvery4Characters(str: string) {
  return str.replace(/(.{4})/g, '$1 ').trim();
}

export function cardNumberMaxLength(type: CardType) {
  if (type == 'diner') {
    return 16;
  } else if (type == 'amex') {
    return 17;
  } else {
    return 23;
  }
}

export function formatCardNumber(value: string, type: CardType) {
  if (
    type == 'unknown' ||
    type == 'visa' ||
    type == 'jcb' ||
    type == 'mastercard'
  ) {
    return insertSpaceEvery4Characters(value);
  } else {
    return value
      .replace(/(.{4})/, '$1 ')
      .replace(/(.{11})/, '$1 ')
      .trim();
  }
}

export const cardTypeRegex = {
  amex: /^3[47]\d{0,13}/,
  diner: /^3(?:0([0-5]|9)|[689]\d?)\d{0,11}/,
  mastercard: /^(5[1-5]\d{0,2}|22[2-9]\d{0,1}|2[3-7]\d{0,2})\d{0,12}/,
  jcb15: /^(?:2131|1800)\d{0,11}/,
  jcb: /^(?:35)\d{0,17}/,
  visa: /^4\d{0,18}/
};

export function cardType(value: string): CardType {
  if (cardTypeRegex.amex.exec(value)) {
    return 'amex';
  } else if (cardTypeRegex.diner.exec(value)) {
    return 'diner';
  } else if (cardTypeRegex.mastercard.exec(value)) {
    return 'mastercard';
  } else if (cardTypeRegex.jcb15.exec(value)) {
    return 'jcb15';
  } else if (cardTypeRegex.jcb.exec(value)) {
    return 'jcb';
  } else if (cardTypeRegex.visa.exec(value)) {
    return 'visa';
  } else {
    return 'unknown';
  }
}

export function luhnCheck(cardNumber: string) {
  // accept only digits and spaces
  if (/[^0-9\s]+/.test(cardNumber)) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;
  cardNumber = cardNumber.replace(/\D/g, '');
  const length = cardNumber.length;

  // iterating backwards, double every second digit
  for (let i = length - 1; i >= 0; --i) {
    let digit = parseInt(cardNumber.charAt(i), 10);

    // double. if doubled digit is > 9, subtract 9
    if (shouldDouble && (digit *= 2) > 9) {
      digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}
