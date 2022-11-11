type ValidationCallback = (input: HTMLInputElement) => string | null;

// Adds validation to an input element.
export function addValidation(input: HTMLInputElement, callback: ValidationCallback) {
  // Tiny detail: if the user has never inputted anything, we don't want to run validations at all
  // at the risk of showing an erro message when the user is just clicking around.
  input.addEventListener('input', () => {
    input.dataset.validationDirty = 'true';
  });

  // On blur, run validations and show an error message if they fail.
  input.addEventListener('blur', (event) => {
    const input = event.target as HTMLInputElement;
    if (input.dataset.validationDirty !== 'true') return;

    const errorMessage = callback(input);

    if (errorMessage) {
      input.classList.add('invalid');
      input.parentElement?.append(createErrorElement(errorMessage));
    }
  });

  // When the user focuses on the input, remove all error artifacts.
  input.addEventListener('focus', (event) => {
    const input = event.target as HTMLInputElement;
    input.classList.remove('invalid');

    input.parentElement?.querySelectorAll('komoju-error').forEach((element) => {
      element.remove();
    });
  });
}

// Creates the error message element that appears under an invalid input.
// Mainly just called by addValidation().
export function createErrorElement(message: string) {
  const el = window.document.createElement('komoju-error');
  el.textContent = message;
  return el;
}
