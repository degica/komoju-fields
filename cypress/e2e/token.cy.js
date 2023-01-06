/// <reference types="cypress" />

describe('KOMOJU Fields: Token mode', () => {
  it('lets me pay for a konbini payment via token', () => {
    // This spec is basically the same as the regular konbini one, but the /token
    // page is set up differently. Rather than submitting directly to KOMOJU from
    // the browser, it first creates a token, sends it to the backend, then submits
    // payment from the back-end.

    cy.visit('/token');

    cy.get('komoju-picker').shadow().contains('Konbini').click();

    cy.get('komoju-fields').shadow().find('#kb-name').type('Test Johnson');
    cy.get('komoju-fields').shadow().find('#kb-email').type('test@example.com', { force: true });
    cy.get('komoju-fields').shadow().contains('Lawson').click();
    cy.contains('Pay').click();

    cy.contains('How to make a payment at Lawson').should('exist');
    cy.contains('Return to').click();

    cy.contains('Thanks for your payment!').should('exist');
    cy.contains('Payment status: authorized').should('exist');
  });

  it('lets me pay for a credit card payment via token', () => {
    cy.visit('/token');
    cy.get('komoju-picker').shadow().contains('Credit Card').click();

    cy.get('komoju-fields').shadow().find('#cc-name').type('John Doe', t);
    cy.get('komoju-fields').shadow().find('#cc-number').type('4242424242424242', t);
    cy.get('komoju-fields').shadow().find('#cc-exp').type('1299', t);
    cy.get('komoju-fields').shadow().find('#cc-cvc').type('111', t);
    cy.contains('Pay').click();

    cy.contains('Thanks for your payment').should('exist');
    cy.contains('Payment status: captured').should('exist');
  });
});
