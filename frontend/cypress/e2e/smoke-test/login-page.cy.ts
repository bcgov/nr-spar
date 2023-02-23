describe('Login page test', () => {
  
  let loginPageData: {
    title: string,
    subtitle: string,
    description: string
  };

  beforeEach(() => {
    cy.visit('/');

    // Clear cookies and local storage
    cy.clearCookies({ log: true })
    cy.clearLocalStorage({ log: true })

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
    cy.get('#idirLogo').should('be.visible');
  });

  it('navigate to the user form page BCeID', () => {
    cy.getByDataTest('landing-button__bceid').click();
    cy.get('#bceidLogo').should('be.visible');
  });

  it('try to access system using a link without user connected', () => {
    cy.visit('https://nrsparwebapp-test-app.apps.silver.devops.gov.bc.ca/dashboard');
    cy.getByDataTest('landing-title').should('have.text', loginPageData.title);
  });

  it.skip('log in with BCeID and validate if after timeout the user is disconnected', () => {
    cy.login();
    cy.wait(1800000); //wait for 30 minutes 1800000
    cy.getByDataTest('landing-title').should('have.text', loginPageData.title);
  });

  it('log in with BCeID and validate user role', () => {
    cy.login();
    cy.getByDataTest('header-button__user').click();
    cy.get('.user-data').find('p').contains('IDIR: undefined');
  });

  it('log in with BCeID and validate user information', () => {
    cy.login();
    cy.getByDataTest('header-button__user').click();
    cy.get('.user-data').find('p').contains('NRS Load Test-3');
    cy.get('.user-data').find('p').contains('nrpp_test@nrpp.compratech.com');
  });

});
