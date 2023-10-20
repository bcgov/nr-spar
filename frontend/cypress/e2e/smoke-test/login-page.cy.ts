import { BCEID_NAME, FIVE_SECONDS, USERNAME } from '../../constants';

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
  });

  it('login page is displayed and loads correctly', () => {
    cy.visit('/');
    cy.getByDataTest('landing-title').should('have.text', loginPageData.title);
    cy.getByDataTest('landing-subtitle').should('have.text', loginPageData.subtitle);
    cy.getByDataTest('landing-desc').should('have.text', loginPageData.description);
  });

  it('navigate to the user form page IDIR', () => {
    cy.visit('/');
    cy.getByDataTest('landing-button__idir').click();
    cy.url().then((url) => {
      if (url.includes('.gov.bc.ca')) {
        cy.get('#idirLogo', { timeout: 5000 }).should('be.visible');
      } else {
        cy.origin(Cypress.env('loginUrl'), { args: { timeout: FIVE_SECONDS } }, ({ timeout }) => {
          cy.get('#idirLogo', { timeout }).should('be.visible');
        });
      }
    });
  });

  it('navigate to the user form page BCeID', () => {
    cy.visit('/');
    cy.getByDataTest('landing-button__bceid').click();
    cy.url().then((url) => {
      if (url.includes('.gov.bc.ca')) {
        cy.get('#bceidLogo', { timeout: 5000 }).should('be.visible');
      } else {
        cy.origin(Cypress.env('loginUrl'), { args: { timeout: FIVE_SECONDS } }, ({ timeout }) => {
          cy.get('#bceidLogo', { timeout }).should('be.visible');
        });
      }
    });
  });

  it('try to access system using a link without user connected', () => {
    cy.visit('/dashboard');
    cy.getByDataTest('landing-title').should('have.text', loginPageData.title);
  });

  it('log in with BCeID and validate user role', () => {
    cy.login();
    cy.visit('/dashboard');
    cy.url().should('contains', '/dashboard');
    cy.contains('Main activities');
    cy.getByDataTest('header-button__user').click();
    cy.get('.user-data').find('p').contains(`BCeID: ${BCEID_NAME}`);
  });

  it('log in with BCeID and validate user information', () => {
    cy.login();
    cy.visit('/dashboard');
    cy.url().should('contains', '/dashboard');
    cy.contains('Main activities');
    cy.getByDataTest('header-button__user').click();
    cy.get('.user-data').find('p').contains(USERNAME);
  });
});
