import prefix from '../../../src/styles/classPrefix';

const FAV_CARD_SELECTOR = '.consep-fav-card p, .consep-fav-card-highlighted p';
const FAV_CARD_CONTAINER_SELECTOR = '.consep-fav-card, .consep-fav-card-highlighted';

/**
 * Opens the overflow menu for a favourite card and clicks the specified action.
 * @param activityName - The display label on the card
 * @param menuLabel - The overflow menu option text to click (e.g. 'Highlight shortcut')
 * @param waitAliases - One or two intercept aliases to wait on after the action
 */
export const runFavouriteCardMenuAction = (
  activityName: string,
  menuLabel: string,
  waitAliases: [string, string]
) => {
  cy.contains(FAV_CARD_SELECTOR, activityName)
    .closest(FAV_CARD_CONTAINER_SELECTOR)
    .find('button.fav-card-overflow')
    .click();

  cy.get(`.fav-card-menu-options, .${prefix}--overflow-menu-options`)
    .contains(menuLabel)
    .click();

  cy.wait(waitAliases[0]);
  cy.wait(waitAliases[1]);
};

/**
 * Returns a Cypress chain targeting the card label element for the given activity.
 * Covers both normal and highlighted card variants.
 */
export const getFavouriteCardLabel = (activityName: string) => cy.contains(FAV_CARD_SELECTOR, activityName);
