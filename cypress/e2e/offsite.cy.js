/// <reference types="cypress" />

describe('KOMOJU Fields: Offsites', () => {
  it('renders customer name for Alipay', () => {
    cy.visit('/type/alipay');

    cy.get('komoju-fields').shadow().find('#offsite-name').type('John Doe');

    cy.contains('Pay').click();

    cy.contains('KOMOJU Offsite Test Page').should('exist');
    cy.contains('Capture').click();

    cy.contains('Thanks for your payment!').should('exist');
    cy.contains('Payment status: captured').should('exist');
  });

  it('renders no fields for PayPay', () => {
    cy.visit('/type/paypay');

    cy.wait(1000);
    cy.get('komoju-fields').shadow().find('input').should('not.exist');

    cy.contains('Pay').click();

    cy.contains('KOMOJU Offsite Test Page').should('exist');
    cy.contains('Capture').click();

    cy.contains('Thanks for your payment!').should('exist');
    cy.contains('Payment status: captured').should('exist');
  });
});
