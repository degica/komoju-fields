/// <reference types="cypress" />

describe('KOMOJU Fields: Konbini', () => {
  it('requires only email address', () => {
    cy.visit('/type/konbini');
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

  it('works even when another <komoju-fields> element is present', () => {
    cy.visit('/double');
    cy.get('#visible-select').select('Konbini');

    cy.get('komoju-fields').shadow().find('#kb-name').type('Test Johnson');
    cy.get('komoju-fields').shadow().find('#kb-email').type('test@example.com', { force: true });
    cy.get('komoju-fields').shadow().contains('Lawson').click();
    cy.contains('Pay').click();

    cy.contains('Thanks for your payment').should('exist');
    cy.contains('Payment status: authorized').should('exist');
  });
});
