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

    cy.contains('How to make a payment at Family Mart').should('exist');
    cy.contains('Return to').click();

    cy.contains('Thanks for your payment!').should('exist');
    cy.contains('Payment status: authorized').should('exist');
  });

  it('works even when another <komoju-fields> element is present', () => {
    cy.visit('/double');
    cy.get('#visible-select').select('Konbini');

    cy.get('komoju-fields').shadow().find('#kb-name').type('Test Johnson');
    cy.get('komoju-fields').shadow().find('#kb-email').type('test@example.com', { force: true });
    cy.get('komoju-fields').shadow().contains('Lawson').click();
    cy.contains('Pay').click();

    cy.contains('How to make a payment at Lawson').should('exist');
    cy.contains('Return to').click();

    cy.contains('Thanks for your payment!').should('exist');
    cy.contains('Payment status: authorized').should('exist');
  });

  it('shows customer fee and DCC info', () => {
    cy.visit('/easy?currency=USD&exchangerate=135.65');

    cy.get('#payment-type-select').select('Konbini');

    cy.get('komoju-fields').shadow().contains('A fee of ¥190 will be included.').should('exist');
    cy.get('komoju-fields').shadow().contains('Payment will be made in JPY: $60.00 → ¥8,139. (total: ¥8,329)').should('exist');

    cy.get('#payment-type-select').select('Credit Card');

    cy.get('komoju-fields').shadow().contains('A fee of ¥190 will be included.').should('not.exist');
    cy.get('komoju-fields').shadow().contains('Payment will be made in JPY: $60.00 → ¥8,139. (total: ¥8,329)').should('not.exist');
  });
});
