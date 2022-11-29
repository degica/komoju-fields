// Add .checked to the parent .radio element when the input is checked.
// This is just to make the CSS a little easier, since we're putting the
// input inside of the label.
export function setupRadioParentCheckedClass(input: HTMLInputElement, document: DocumentFragment) {
  // Some sanity checks
  if (!input.parentElement) {
    throw new Error('KOMOJU Fields bug: radio input has no parent');
  }
  if (!input.parentElement.classList.contains('radio')) {
    throw new Error('KOMOJU Fields bug: radio input parent has no .radio class');
  }

  // Initialize the checked class
  if (input.checked) {
    input.parentElement.classList.add('checked');
  }

  // Set checked class then checked
  input.addEventListener('change', () => {
    document.querySelectorAll('.radio.checked').forEach((el) => el.classList.remove('checked'));
    input.parentElement!.classList.add('checked');
  });
}
