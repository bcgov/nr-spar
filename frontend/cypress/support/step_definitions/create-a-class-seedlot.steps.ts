import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import prefix from '../../../src/styles/classPrefix';
import { TYPE_DELAY, INVALID_EMAIL } from '../../constants';
import { SeedlotRegistrationSelectors } from '../../utils/selectors';
import { SeedlotActivities, PageHeaderLabels } from '../../utils/labels';
import { SeedlotRegFixtureType } from '../../definitions';

let fixtureData: SeedlotRegFixtureType = {};

const getRegData = (speciesKey: string) => {
  const regData = fixtureData[speciesKey];

  if (!regData) {
    throw new Error(`Missing fixture data for species key: ${speciesKey}`);
  }

  return regData;
};

When('I start a-class seedlot registration', () => {
  cy.get('@aClassSeedlotData').then((data: any) => {
    fixtureData = data as SeedlotRegFixtureType;
  });

  cy.get(SeedlotRegistrationSelectors.SeedlotActivitiesCardTitle)
    .contains(SeedlotActivities.RegisterAClass)
    .click();
});

Then('I should be on the create a-class page', () => {
  cy.url().should('include', '/register-a-class');
  cy.get('.title-section h1')
    .should('have.text', PageHeaderLabels.CreateAClass);
});

When('I fill agency number for {string}', (speciesKey: string) => {
  const regData = getRegData(speciesKey);

  cy.get('#applicant-info-input')
    .should('have.value', regData.agencyAcronym);

  cy.get('#agency-number-input')
    .clear()
    .type(regData.agencyNumber, { delay: TYPE_DELAY });
});

When('I enter an invalid email', () => {
  cy.get('#applicant-email-input')
    .clear()
    .type(INVALID_EMAIL, { delay: TYPE_DELAY });

  cy.get('#agency-number-input').click();
});

Then('I should see email validation error', () => {
  cy.get('#applicant-email-input-error-msg')
    .should('be.visible');
});

When('I enter a valid email for {string}', (speciesKey: string) => {
  const regData = getRegData(speciesKey);

  cy.get('#applicant-email-input')
    .clear()
    .type(regData.email, { delay: TYPE_DELAY });
});

When('I select seedlot species for {string}', (speciesKey: string) => {
  const regData = getRegData(speciesKey);

  cy.get('#seedlot-species-combobox')
    .click();
  cy.contains(`.${prefix}--list-box__menu-item__option`, regData.species)
    .scrollIntoView()
    .click();
});

Then('default a-class source radio buttons should be validated', () => {
  cy.get('#seedlot-source-radio-btn-tpt')
    .should('be.checked');
  cy.get('#seedlot-source-radio-btn-upt')
    .should('not.be.checked');
  cy.get('#seedlot-source-radio-btn-cus')
    .should('not.be.checked');
});

Then('default tree seed centre radio buttons should be validated', () => {
  cy.get('#register-w-tsc-yes')
    .should('be.checked');
  cy.get('#register-w-tsc-no')
    .should('not.be.checked');
});

When('I set tree seed centre option for {string}', (speciesKey: string) => {
  const regData = getRegData(speciesKey);
  const regIdToClick = regData.toBeRegistered ? '#register-w-tsc-yes' : '#register-w-tsc-no';

  cy.get(regIdToClick)
    .siblings(`.${prefix}--radio-button__label`)
    .find(`.${prefix}--radio-button__appearance`)
    .click();
});

Then('selected tree seed centre option should be validated for {string}', (speciesKey: string) => {
  const regData = getRegData(speciesKey);
  const regIdToCheck = regData.toBeRegistered ? '#register-w-tsc-yes' : '#register-w-tsc-no';

  cy.get(regIdToCheck)
    .should('be.checked');
});

Then('default location within BC radio buttons should be validated', () => {
  cy.get('#collected-within-bc-yes')
    .should('be.checked');
  cy.get('#collected-within-bc-no')
    .should('not.be.checked');
});

When('I set location within BC option for {string}', (speciesKey: string) => {
  const regData = getRegData(speciesKey);
  const collectedIdToClick = regData.withinBc ? '#collected-within-bc-yes' : '#collected-within-bc-no';

  cy.get(collectedIdToClick)
    .siblings(`.${prefix}--radio-button__label`)
    .find(`.${prefix}--radio-button__appearance`)
    .click();
});

Then('selected location within BC option should be validated for {string}', (speciesKey: string) => {
  const regData = getRegData(speciesKey);
  const collectedIdToCheck = regData.withinBc ? '#collected-within-bc-yes' : '#collected-within-bc-no';

  cy.get(collectedIdToCheck)
    .should('be.checked');
});

When('I submit the create seedlot form', () => {
  cy.get('.submit-button')
    .click();
});

Then('I should be on the creation success page', () => {
  cy.url().should('include', '/creation-success');
});

Then('I store created seedlot number for {string}', (speciesKey: string) => {
  const regData = getRegData(speciesKey);

  cy.get('#created-seedlot-number')
    .invoke('text')
    .then((seedlotNumber) => {
      cy.task('setData', [regData.species, seedlotNumber]);
    });

  cy.log('A-Class seedlot created with species', regData.species);
});
