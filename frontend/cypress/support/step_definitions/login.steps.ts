import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I visit the landing page', () => {
  cy.visit('/');
});

When('I click the {string} login button', (provider: string) => {
  cy.getByDataTest(`landing-button__${provider}`);
  cy.getByDataTest(`landing-button__${provider}`).click();
});

Given('BC Gov SSO sign-in is stubbed', () => {
  cy.intercept('GET', '**/auth/realms/standard/protocol/openid-connect/auth*', {
    statusCode: 200,
    body: '<html><body>BC Gov SSO</body></html>',
    headers: { 'content-type': 'text/html' }
  }).as('ssoAuthorize');
});

Then('I am sent to BC Gov SSO with the {string} identity provider', (idpHint: string) => {
  cy.wait('@ssoAuthorize').its('request.url').should((url: string) => {
    const params = new URL(url).searchParams;
    expect(params.get('kc_idp_hint')).to.eq(idpHint);
    expect(params.get('client_id')).to.eq('spar-seed-planning-and-registry-application-6734');
    expect(params.get('code_challenge_method')).to.eq('S256');
  });
});

Then('I should see the {string} logo', (logoId: string) => {
  cy.env(['LOGIN_SERVICE', 'idirLoginUrl', 'businessBceIdLoginUrl']).then((env) => {
    const loginUrl = env.LOGIN_SERVICE === 'BCeID'
      ? env.businessBceIdLoginUrl
      : env.idirLoginUrl;

    cy.url().then((url) => {
      if (url.includes('.gov.bc.ca')) {
        cy.get(`#${logoId}`).should('be.visible');
      } else {
        if (!loginUrl) {
          throw new Error('Missing login URL env var for selected login service');
        }

        cy.origin(loginUrl, { args: { logoId } }, ({ logoId: id }) => {
          cy.get(`#${id}`).should('be.visible');
        });
      }
    });
  });
});

Then('I can see the login title {string}', (text: string) => {
  cy.getByDataTest('landing-title').should('have.text', text);
});

Then('I can see the login subtitle {string}', (text: string) => {
  cy.getByDataTest('landing-subtitle').should('have.text', text);
});

Then('I can see the login description {string}', (text: string) => {
  cy.getByDataTest('landing-desc').should('have.text', text);
});

When('I visit {string} without logging in', (path: string) => {
  cy.visit(path);
});

Given('I am logged in', () => {
  cy.login();
});

When('I visit {string}', (path: string) => {
  cy.visit(path);
});

Then('the URL should contain {string}', (segment: string) => {
  cy.url().should('include', segment);
});

Then('I can read {string}', (text: string) => {
  cy.contains(text).should('be.visible');
});

Then('I open the user profile panel', () => {
  cy.getByDataTest('header-button__user').click();
});

Then('I should see my login service prefix', () => {
  cy.env(['LOGIN_SERVICE']).then((env) => {
    const loginService = env.LOGIN_SERVICE === 'BCeID' ? 'BCeID: ' : 'IDIR: ';
    cy.get('.user-data').find('p').contains(loginService).should('exist');
  });
});

Then('I should see an email address', () => {
  cy.get('.user-data').find('p').contains('@').should('exist');
});
