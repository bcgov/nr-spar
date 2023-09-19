describe('Login page test', () => {
  let loginPageData: {
    title: string,
    subtitle: string,
    description: string
  };

  beforeEach(() => {
    cy.visit('/');
    cy.wait(2 * 1000);

    // Clear cookies and local storage
    cy.clearCookies({ log: true });
    cy.clearLocalStorage({ log: true });

    // Loading test data
    cy.fixture('login-page').then((ttls) => {
      loginPageData = ttls;
    });
  });

  it('login page is displayed and loads correctly', () => {
    cy.getByDataTest('landing-title').should('have.text', loginPageData.title);
    cy.getByDataTest('landing-subtitle').should('have.text', loginPageData.subtitle);
    cy.getByDataTest('landing-desc').should('have.text', loginPageData.description);
  });

  it('navigate to the user form page IDIR', () => {
    cy.getByDataTest('landing-button__idir').click();
    cy.origin(Cypress.env('keycloakLoginUrl'), () => {
      cy.get('#idirLogo', { timeout: 6000 }).should('be.visible');
    });
  });

  it('navigate to the user form page BCeID', () => {
    cy.getByDataTest('landing-button__bceid').click();
    cy.origin(Cypress.env('keycloakLoginUrl'), () => {
      cy.get('#bceidLogo', { timeout: 6000 }).should('be.visible');
    });
  });

  it('try to access system using a link without user connected', () => {
    cy.visit('/dashboard');
    cy.getByDataTest('landing-title').should('have.text', loginPageData.title);
  });
  // The following test is commented until its fixed:
  // it.skip('log in with BCeID and validate if after timeout the user is disconnected', () => {
  //   cy.login();
  //   // wait for 6 minutes
  //   // eslint-disable-next-line cypress/no-unnecessary-waiting
  //   cy.wait(6 * 60 * 1000);
  //   cy.getByDataTest('landing-title').should('have.text', loginPageData.title);
  //   cy.reload();
  // });

  it('log in with BCeID and validate user role', () => {
    cy.login();
    cy.wait(10 * 1000);
    cy.contains('Main activities');
    cy.getByDataTest('header-button__user').click();
    cy.get('.user-data').find('p').contains('IDIR: undefined');
  });

  it('log in with BCeID and validate user information', () => {
    cy.login();
    cy.wait(10 * 1000); // login is lagging, remove this in the future

    cy.contains('Main activities');
    cy.getByDataTest('header-button__user').click();
    cy.get('.user-data').find('p').contains('NRS Load Test-3');
    cy.get('.user-data').find('p').contains('nrpp_test@nrpp.compratech.com');
  });
});
