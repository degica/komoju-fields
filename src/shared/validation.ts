// Adds validation to an input element.
export function addValidation<Translations extends I18n>(
  _i18n: Translations, // Used only by typescript to compile-time catch missing translations.
  input: HTMLInputElement,
  callback: (input: HTMLInputElement) => keyof Translations['en'] | null
) {
  // Add a class so that we know this input has validation.
  input.classList.add('has-validation');

  // Tiny detail: if the user has never inputted anything, we don't want to run validations at all
  // at the risk of showing an error message when the user is just clicking around.
  input.addEventListener('input', () => {
    input.dataset.validationDirty = 'true';
  });

  // Validation function. This will be called on 'blur' and also on a custom 'validate' event.
  const validate = (event: Event) => {
    const input = event.target as HTMLInputElement;

    const errorMessageKey = callback(input);

    if (errorMessageKey) {
      input.classList.add('invalid');
      input.parentElement?.append(createErrorElement(errorMessageKey as string));
    }
  };
  input.addEventListener('blur', (event) => {
    if (input.dataset.validationDirty !== 'true') return;
    else return validate(event);
  });
  input.addEventListener('validate', validate);

  // When the user focuses on the input, remove all error artifacts.
  input.addEventListener('focus', (event) => {
    const input = event.target as HTMLInputElement;
    input.classList.remove('invalid');

    input.parentElement?.querySelectorAll('komoju-error:not(.removing)').forEach((element) => {
      element.remove();
    });
  });
}

// Runs validations on an <input> element.
export function runValidation(input: HTMLInputElement) {
  // Fire the 'validate' custom event.
  input.dispatchEvent(new CustomEvent('validate'));

  // If there's an error message, return it.
  const errorMessage = input.parentElement?.querySelector('komoju-error:not(.removing)')?.textContent;
  return errorMessage ?? null;
}

// Creates the error message element that appears under an invalid input.
// Mainly just called by addValidation().
export function createErrorElement(messageKey: string) {
  const el = window.document.createElement('komoju-error');
  const i18nEl = window.document.createElement('komoju-i18n') as KomojuI18nElement;
  i18nEl.key = messageKey;
  el.appendChild(i18nEl);
  return el;
}
