// @ts-check
/// <reference path="../global.d.ts" />

import '@cypress/code-coverage/support';
import {
  THIRTY_SECONDS, HALF_SECOND, TYPE_DELAY, THREE_SECONDS
} from '../constants';
import { GenericSelectors, NavigationSelectors } from '../utils/selectors';
import prefix from '../../src/styles/classPrefix';

Cypress.Commands.add('getByDataTest', (selector) => cy.get(`[data-testid=${selector}]`));

Cypress.Commands.add('login', () => cy
  .env<{
    USERNAME?: string;
    PASSWORD?: string;
    LOGIN_SERVICE?: string;
    idirLoginUrl?: string;
    businessBceIdLoginUrl?: string;
  }>([
    'USERNAME',
    'PASSWORD',
    'LOGIN_SERVICE',
    'idirLoginUrl',
    'businessBceIdLoginUrl'
  ])
  .then((env) => {
    const config = {
      username: env.USERNAME ?? '',
      password: env.PASSWORD ?? '',
      timeout: HALF_SECOND,
      loginService: env.LOGIN_SERVICE ?? 'IDIR',
      delay: TYPE_DELAY
    };

    if (!config.username || !config.password) {
      throw new Error('Missing Cypress env vars: USERNAME or PASSWORD');
    }

    const loginUrl = config.loginService === 'IDIR'
      ? env.idirLoginUrl
      : env.businessBceIdLoginUrl;

    return cy.session(
      config.username,
      () => {
        cy.on('uncaught:exception', (err) => {
          if (err.message.includes('missing ) after argument list')) {
            return false;
          }
          return true;
        });

        const loginBtnId = `landing-button__${config.loginService.toLowerCase()}`;
        const loginLogo = `#${config.loginService.toLowerCase()}Logo`;

        cy.clearAllCookies();
        cy.clearAllLocalStorage();
        cy.clearAllSessionStorage();
        cy.visit('/');
        cy.getByDataTest(loginBtnId).click();

        const SUBMIT_SELECTOR = 'input[name=btnSubmit]';

        cy.url().then((url) => {
          if (url.includes('.gov.bc.ca')) {
            cy.get(loginLogo, { timeout: config.timeout }).should('be.visible');
            cy.get('input[name=user]').clear().type(config.username, { delay: config.delay });
            cy.get('input[name=password]').clear().type(config.password, { delay: config.delay });
            cy.get('body').then(($body) => {
              const $submit = $body.find(SUBMIT_SELECTOR);
              if ($submit.length > 0) {
                cy.wrap($submit.first()).click();
              }
            });
          } else {
            if (!loginUrl) {
              throw new Error('Missing login URL env var for selected login service');
            }

            cy.origin(
              loginUrl,
              {
                args: {
                  username: config.username,
                  password: config.password,
                  delay: config.delay,
                  timeout: config.timeout,
                  loginService: config.loginService
                }
              },
              ({
                username, password, delay, timeout, loginService
              }) => {
                cy.get(`#${loginService.toLowerCase()}Logo`, { timeout }).should('be.visible');
                cy.get('input[name=user]').clear().type(username, { delay });
                cy.get('input[name=password]').clear().type(password, { delay });
                const submitSelector = 'input[name=btnSubmit]';
                cy.get('body').then(($body) => {
                  const $submit = $body.find(submitSelector);
                  if ($submit.length > 0) {
                    cy.wrap($submit.first()).click();
                  }
                });
              }
            );
          }
        });

        cy.get('.bx--contained-list-item__content')
          .contains('WESTERN FOREST PRODUCTS INC.')
          .click();
        cy.get('.action-btn').contains('Continue').click();

        cy.url().should('contains', '/dashboard');
        cy.setCookie('is-cypress-logged-in', 'true');
      },
      {
        validate: () => {
          cy.getCookie('is-cypress-logged-in').should('exist');
        },
        cacheAcrossSpecs: true
      }
    );
  }));

Cypress.Commands.add('navigateTo', (menuItem) => {
  cy.get(NavigationSelectors.NavigationSideMenu)
    .contains(menuItem)
    .click();
});

Cypress.Commands.add('isPageTitle', (pageTitle) => {
  cy.get(GenericSelectors.PageTitle)
    .should('contain.text', pageTitle);
});

Cypress.Commands.add('toogleFavourite', () => {
  cy.get(GenericSelectors.FavouriteButton)
    .click();
});

Cypress.Commands.overwrite('log', (log, ...args) => {
  if (Cypress.browser.isHeadless) {
    return cy.task('log', args, { log: false }).then(() => log(...args));
  }
  // eslint-disable-next-line no-console
  console.log(...args);
  return log(...args);
});

Cypress.Commands.add('saveSeedlotRegFormProgress', () => {
  cy.get('.seedlot-registration-button-row')
    .find('button.form-action-btn')
    .should('not.be.disabled');

  cy.get('.seedlot-registration-button-row')
    .find('button.form-action-btn')
    .contains('Save changes')
    .click();

  cy.get('.seedlot-registration-button-row')
    .find('button.form-action-btn')
    .contains('Changes saved!', { timeout: 3 * THIRTY_SECONDS });
});

Cypress.Commands.add('closeMenuIfOpen', () => {
  cy.get(`button.${prefix}--header__menu-toggle`)
    .then(($btn) => {
      if ($btn.attr('aria-label') === 'Close menu') {
        cy.wrap($btn).click();
        // Optionally, verify it changed to "Open menu"
        cy.wrap($btn).should('have.attr', 'aria-label', 'Open menu');
      }
    });
});

Cypress.Commands.add('waitForTableData', (tableSelector: string, timeout: number = THREE_SECONDS) => {
  cy.get(tableSelector)
    .find('tbody tr', { timeout })
    .should('have.length.greaterThan', 0);

  cy.get(tableSelector)
    .find('tbody tr', { timeout })
    .first()
    .find('td:nth-child(2) input', { timeout })
    .should(($input) => expect($input.val()).to.not.be.empty);
});

Cypress.Commands.add('setFlatpickrDate', (selector: string, dateValue: string) => cy.get(`${selector}.flatpickr-input`)
  .should('exist')
  .then(($dt) => {
    const element = $dt.get(0) as HTMLElement;
    // eslint-disable-next-line no-underscore-dangle
    const flatpickrApi = (element as Record<string, any>)._flatpickr;

    if (!flatpickrApi) {
      throw new Error(`Flatpickr is not initialized for ${selector}`);
    }

    flatpickrApi.setDate(dateValue, true, 'Y/m/d');
    return $dt;
  }));
