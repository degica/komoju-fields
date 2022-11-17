/// <reference types="cypress" />

describe('KOMOJU Fields: Konbini', () => {
  beforeEach(() => {
    cy.visit('/type/konbini');
  });

  it('requires only email address', () => {
    cy.get('komoju-fields').shadow().contains('Name (shown on receipt)').should('exist');

    cy.contains('Pay').click();
    cy.get('komoju-fields').shadow().contains('Required').should('exist');

    cy.get('komoju-fields').shadow().find('#kb-email').type('test@example.com');
    cy.get('komoju-fields').shadow().find('#kb-name').type('Test Johnson', { force: true });
    cy.get('komoju-fields').shadow().contains('Required').should('not.exist');

    cy.get('komoju-fields').shadow().contains('FamilyMart').click();
    cy.contains('Pay').click();

    // TODO: actually we're supposed to be on KOMOJU's hosted page right now to see payment instructions.
    // should click "return to merchant".

    cy.contains('Thanks for your payment').should('exist');
    cy.contains('Payment status: authorized').should('exist');
  });
});
