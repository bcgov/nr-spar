import { HALF_SECOND, FIVE_SECOND } from '../../constants';

describe('Login page test', () => {
  let loginPageData: {
    title: string,
    subtitle: string,
    description: string
  };

  beforeEach(() => {
    // Loading test data
    cy.fixture('login-page').then((ttls) => {
      loginPageData = ttls;
    });
    cy.visit('/');
    cy.wait(HALF_SECOND);
  });

  it('login page is displayed and loads correctly', () => {
    cy.getByDataTest('landing-title').should('have.text', loginPageData.title);
    cy.getByDataTest('landing-subtitle').should('have.text', loginPageData.subtitle);
    cy.getByDataTest('landing-desc').should('have.text', loginPageData.description);
  });

  it('navigate to the user form page IDIR', () => {
    cy.getByDataTest('landing-button__idir').click();
    cy.origin(Cypress.env('keycloakLoginUrl'), { args: { timeout: FIVE_SECOND } }, ({ timeout }) => {
      cy.get('#idirLogo', { timeout }).should('be.visible');
    });
  });

  it('navigate to the user form page BCeID', () => {
    cy.getByDataTest('landing-button__bceid').click();
    cy.origin(Cypress.env('keycloakLoginUrl'), { args: { timeout: FIVE_SECOND } }, ({ timeout }) => {
      cy.get('#bceidLogo', { timeout }).should('be.visible');
    });
  });

  it('try to access system using a link without user connected', () => {
    cy.visit('/dashboard');
    cy.getByDataTest('landing-title').should('have.text', loginPageData.title);
  });

  it('log in with BCeID and validate user role', () => {
    cy.login();
    cy.visit('/');
    cy.contains('Main activities');
    cy.getByDataTest('header-button__user').click();
    cy.get('.user-data').find('p').contains('IDIR: undefined');
  });

  it('log in with BCeID and validate user information', () => {
    cy.login();
    cy.visit('/');
    cy.contains('Main activities');
    cy.getByDataTest('header-button__user').click();
    cy.get('.user-data').find('p').contains('NRS Load Test-3');
    cy.get('.user-data').find('p').contains('nrpp_test@nrpp.compratech.com');
  });
});
