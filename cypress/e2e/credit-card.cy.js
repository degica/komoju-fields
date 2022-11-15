/// <reference types="cypress" />

describe('KOMOJU Fields: Credit Card', () => {
  it('can fill out the credit card fields', () => {
    cy.visit('/')
    cy.get('komoju-fields').shadow().find('#cc-name').type('John Doe');
    cy.get('komoju-fields').shadow().find('#cc-number').type('4242424242424242');
    cy.get('komoju-fields').shadow().find('#cc-exp').type('1299');
    cy.get('komoju-fields').shadow().find('#cc-cvc').type('111');
    cy.contains('Pay').click();

    cy.contains('Thanks for your payment').should('exist');
  });

  it('shows errors on invalid input', () => {
    cy.visit('/')

    cy.log('Invalid card number');
    cy.get('komoju-fields').shadow().find('#cc-name').type('John Doe');
    cy.get('komoju-fields').shadow().find('#cc-number').type('1234123412341234');
    cy.get('komoju-fields').shadow().find('#cc-exp').type('1299');
    cy.get('komoju-fields').shadow().find('#cc-cvc').type('111');
    // -------------------------------------------------------- //
    cy.get('komoju-fields').shadow().contains('Invalid number').should('exist');
    cy.get('komoju-fields').shadow().find('#cc-number').type('{selectall}4111111111111111');
    cy.get('komoju-fields').shadow().contains('Invalid number').should('not.exist');

    cy.log('Name is required');
    cy.get('komoju-fields').shadow().find('#cc-name').type('{selectall}{backspace}');
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    // -------------------------------------------------------- //
    cy.get('komoju-fields').shadow().contains('Required').should('exist');
    cy.get('komoju-fields').shadow().find('#cc-name').type('Jane Doe');
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    cy.get('komoju-fields').shadow().contains('Required').should('not.exist');

    cy.log('CVC is required');
    cy.get('komoju-fields').shadow().find('#cc-cvc').type('{selectall}{backspace}');
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    // -------------------------------------------------------- //
    cy.get('komoju-fields').shadow().contains('Required').should('exist');
    cy.get('komoju-fields').shadow().find('#cc-cvc').type('999');
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    cy.get('komoju-fields').shadow().contains('Required').should('not.exist');

    cy.log('Expiration date must be formatted correctly');
    cy.get('komoju-fields').shadow().find('#cc-exp').type('{selectall}0 0');
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    cy.get('komoju-fields').shadow().contains('Please input the full expiration date').should('exist');
    // -------------------------------------------------------- //
    cy.get('komoju-fields').shadow().find('#cc-exp').type('{selectall}1299');
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    cy.get('komoju-fields').shadow().contains('Please input the full expiration date').should('not.exist');

    cy.log('Expiration date cannot be in the past');
    cy.get('komoju-fields').shadow().find('#cc-exp').type('{selectall}0521');
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    cy.get('komoju-fields').shadow().contains('Card is expired').should('exist');
    // -------------------------------------------------------- //
    cy.get('komoju-fields').shadow().find('#cc-exp').type('{selectall}1299');
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    cy.get('komoju-fields').shadow().contains('Card is expired').should('not.exist');

    cy.log('Expiration date cannot have an invalid month');
    cy.get('komoju-fields').shadow().find('#cc-exp').type('{selectall}1399');
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    cy.get('komoju-fields').shadow().contains('Month must be between 1 and 12').should('exist');
    // -------------------------------------------------------- //
    cy.get('komoju-fields').shadow().find('#cc-exp').type('{selectall}1299');
    cy.get('komoju-fields').shadow().find('#cc-number').click();
    cy.get('komoju-fields').shadow().contains('Month must be between 1 and 12').should('not.exist');
  });

  it('shows errors when I try to submit an empty form', () => {
    cy.visit('/')

    // Kind of a hack just to wait for the fields to actually load before clicking Pay.
    cy.get('komoju-fields').shadow().find('#cc-name').type('John Doe');

    cy.contains('Pay').click();
    cy.get('komoju-fields').shadow().contains('Required').should('exist');
    cy.get('komoju-fields').shadow().contains('Please input the full expiration date').should('exist');
    cy.contains('Pay').click();
  });
});
