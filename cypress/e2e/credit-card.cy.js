/// <reference types="cypress" />

// Bad hack because Cypress can't handle shadow DOM inputs
// https://github.com/cypress-io/cypress/issues/5830#issuecomment-1255597764
const t = { force: true };

describe('KOMOJU Fields: Credit Card', () => {
  it('can fill out the credit card fields', () => {
    cy.visit('/type/credit_card');
    cy.get('komoju-fields').shadow().find('#cc-name').type('John Doe', t);
    cy.get('komoju-fields').shadow().find('#cc-number').type('4242424242424242', t);
    cy.get('komoju-fields').shadow().find('#cc-exp').type('1299', t);
    cy.get('komoju-fields').shadow().find('#cc-cvc').type('111', t);
    cy.contains('Pay').click();

    cy.contains('Thanks for your payment').should('exist');
  });

  it('shows errors on invalid input', () => {
    cy.visit('/type/credit_card');

    cy.log('Invalid card number');
    cy.get('komoju-fields').shadow().find('#cc-name').type('John Doe');
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    cy.get('komoju-fields').shadow().find('#cc-number')
      .type('1234123412341234', t)
      // I'm baffled as to why I need to emit the blur event manually here.
      .then(($input) => $input[0].dispatchEvent(new Event('blur')));
    cy.get('komoju-fields').shadow().find('#cc-name').click();
    cy.get('komoju-fields').shadow().find('#cc-exp').type('1299');
    cy.get('komoju-fields').shadow().find('#cc-name').click();
    cy.get('komoju-fields').shadow().find('#cc-cvc').type('111');
    cy.get('komoju-fields').shadow().find('#cc-name').click();
    // -------------------------------------------------------- //
    cy.get('komoju-fields').shadow().contains('Invalid number').should('exist');
    cy.get('komoju-fields').shadow().find('#cc-number').type('{selectall}4111111111111111', t);
    cy.get('komoju-fields').shadow()
      .find('.field-number').contains('Invalid number').should('not.exist');

    cy.log('Name is required');
    cy.get('komoju-fields').shadow().find('#cc-name').type('{selectall}{backspace}', t)
      .then(($input) => $input[0].dispatchEvent(new Event('blur')));
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    // -------------------------------------------------------- //
    cy.get('komoju-fields').shadow().contains('Required').should('exist');
    cy.get('komoju-fields').shadow().find('#cc-name').type('Jane Doe', t);
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    cy.get('komoju-fields').shadow().contains('Required').should('not.exist');

    cy.log('CVC is required');
    cy.get('komoju-fields').shadow().find('#cc-cvc').type('{selectall}{backspace}', t)
      .then(($input) => $input[0].dispatchEvent(new Event('blur')));
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    // -------------------------------------------------------- //
    cy.get('komoju-fields').shadow()
      .find('.field-cvc').contains('Required').should('exist');
    cy.get('komoju-fields').shadow().find('#cc-cvc').type('999', t);
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    cy.get('komoju-fields').shadow().contains('Required').should('not.exist');

    cy.log('Expiration date must be formatted correctly');
    cy.get('komoju-fields').shadow().find('#cc-exp').type('{selectall}0 0', t)
      .then(($input) => $input[0].dispatchEvent(new Event('blur')));
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    cy.get('komoju-fields').shadow().contains('Please input the full expiration date').should('exist');
    // -------------------------------------------------------- //
    cy.get('komoju-fields').shadow().find('#cc-exp').type('{selectall}1299', t)
      .then(($input) => $input[0].dispatchEvent(new Event('blur')));
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    cy.get('komoju-fields').shadow().contains('Please input the full expiration date').should('not.exist');

    cy.log('Expiration date cannot be in the past');
    cy.get('komoju-fields').shadow().find('#cc-exp').type('{selectall}0521', t)
      .then(($input) => $input[0].dispatchEvent(new Event('blur')));
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    cy.get('komoju-fields').shadow().contains('Card is expired').should('exist');
    // -------------------------------------------------------- //
    cy.get('komoju-fields').shadow().find('#cc-exp').type('{selectall}1299', t)
      .then(($input) => $input[0].dispatchEvent(new Event('blur')));
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    cy.get('komoju-fields').shadow().contains('Card is expired').should('not.exist');

    cy.log('Expiration date cannot have an invalid month');
    cy.get('komoju-fields').shadow().find('#cc-exp').type('{selectall}1399', t)
      .then(($input) => $input[0].dispatchEvent(new Event('blur')));
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    cy.get('komoju-fields').shadow().contains('Month must be between 1 and 12').should('exist');
    // -------------------------------------------------------- //
    cy.get('komoju-fields').shadow().find('#cc-exp').type('{selectall}1299', t)
      .then(($input) => $input[0].dispatchEvent(new Event('blur')));
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    cy.get('komoju-fields').shadow().contains('Month must be between 1 and 12').should('not.exist');
  });

  it('shows errors when I try to submit an empty form, lets me switch languages', () => {
    cy.visit('/type/credit_card');

    // Kind of a hack just to wait for the fields to actually load before clicking Pay.
    cy.get('komoju-fields').shadow().find('#cc-name').type('John Doe', t);

    cy.contains('Pay').click();
    cy.get('komoju-fields').shadow().contains('Required').should('exist');
    cy.get('komoju-fields').shadow().contains('Please input the full expiration date').should('exist');
    cy.contains('Pay').click();

    // Now we can switch languages and the errors should be translated along with the rest of the page.
    cy.get('#locale-select').select('Japanese');
    cy.get('komoju-fields').shadow().contains('Cardholder name').should('not.exist');
    cy.get('komoju-fields').shadow().contains('カード所有者名').should('exist');
    cy.get('komoju-fields').shadow().contains('Required').should('not.exist');
    cy.get('komoju-fields').shadow().contains('必須項目です').should('exist');
  });

  it('works even when another <komoju-fields> element is present', () => {
    cy.visit('/double');
    cy.get('#visible-select').select('Credit Card');

    cy.get('komoju-fields').shadow().find('#cc-name').type('John Doe', t);
    cy.get('komoju-fields').shadow().find('#cc-number').type('4242424242424242', t);
    cy.get('komoju-fields').shadow().find('#cc-exp').type('1299', t);
    cy.get('komoju-fields').shadow().find('#cc-cvc').type('111', t);
    cy.contains('Pay').click();

    cy.contains('Thanks for your payment').should('exist');
    cy.contains('Payment status: captured').should('exist');
  });

  it('informs the user when they try to use an unsupported brand', () => {
    cy.visit('/type/credit_card?brands=visa,jcb,master');

    // Enter an American Express card number (not visa, jcb, nor master)
    cy.get('komoju-fields').shadow().find('#cc-number').type('36', t);
    cy.get('komoju-fields').shadow().contains('Unsupported card brand').should('exist');

    // Should show all card icons
    cy.get('komoju-fields').shadow()
      .find('#cc-icon').shadow()
      .find('img:visible').its('length').should('eq', 3)

    // Delete the bad number - this should remove the error message
    cy.get('komoju-fields').shadow().find('#cc-number').type('{backspace}{backspace}', t);
    cy.get('komoju-fields').shadow().find('#cc-name').type('a', t);
    cy.get('komoju-fields').shadow().contains('Unsupported card brand').should('not.exist');

    // Should show all card icons
    cy.get('komoju-fields').shadow()
      .find('#cc-icon').shadow()
      .find('img:visible').its('length').should('eq', 3)

    // Enter a full JCB number
    cy.get('komoju-fields').shadow().find('#cc-number').type('3530111333300000', { force: true });
    cy.get('komoju-fields').shadow().find('#cc-name').type('a', t);
    cy.get('komoju-fields').shadow().contains('Unsupported card brand').should('not.exist');

    // Should show only JCB icon
    cy.get('komoju-fields').shadow()
      .find('#cc-icon').shadow()
      .find('img:visible').then($img => {
        expect($img).to.have.length(1);
        expect($img.first().attr('src')).to.include('?brands=jcb');
      });
  });
});
