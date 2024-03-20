import { FIVE_SECONDS } from '../../constants';

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

  it('should load and display login page correctly', () => {
    cy.visit('/');
    cy.getByDataTest('landing-title').should('have.text', loginPageData.title);
    cy.getByDataTest('landing-subtitle').should('have.text', loginPageData.subtitle);
    cy.getByDataTest('landing-desc').should('have.text', loginPageData.description);
  });

  it('should navigate to the IDIR login page', () => {
    const loginUrl = Cypress.env('LOGIN_SERVICE') === 'BCeID' ?
          Cypress.env('idirLoginUrl') : Cypress.env('businessBceIdLoginUrl');
    cy.visit('/');
    cy.getByDataTest('landing-button__idir').click();
    cy.url().then((url) => {
      if (url.includes('.gov.bc.ca')) {
        cy.get('#idirLogo', { timeout: 5000 }).should('be.visible');
      } else {
        cy.origin(loginUrl, { args: { timeout: FIVE_SECONDS } }, ({ timeout }) => {
          cy.get('#idirLogo', { timeout }).should('be.visible');
        });
      }
    });
  });

  it('should navigate to the BCeID login page', () => {
    const loginUrl = Cypress.env('LOGIN_SERVICE') === 'BCeID' ?
          Cypress.env('idirLoginUrl') : Cypress.env('businessBceIdLoginUrl');
    cy.visit('/');
    cy.getByDataTest('landing-button__bceid').click();
    cy.url().then((url) => {
      if (url.includes('.gov.bc.ca')) {
        cy.get('#bceidLogo', { timeout: 5000 }).should('be.visible');
      } else {
        cy.origin(loginUrl, { args: { timeout: FIVE_SECONDS } }, ({ timeout }) => {
          cy.get('#bceidLogo', { timeout }).should('be.visible');
        });
      }
    });
  });

  it('should try to access system using a link without user connected', () => {
    cy.visit('/dashboard');
    cy.getByDataTest('landing-title').should('have.text', loginPageData.title);
  });

  it('can log in with BCeID/IDIR and validate user role', () => {
    const loginService = Cypress.env('LOGIN_SERVICE') === 'BCeID' ? 'BCeID: ' : 'IDIR: ';
    cy.login();
    cy.visit('/dashboard');
    cy.url().should('contains', '/dashboard');
    cy.contains('Main activities');
    cy.getByDataTest('header-button__user').click();
    cy.get('.user-data').find('p').contains(loginService);
    cy.get('.user-data').find('p').contains('@');
  });
});
