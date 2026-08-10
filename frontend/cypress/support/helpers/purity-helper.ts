/**
 * Converts a 1-based display index (rank/position as shown in the UI)
 * to a 0-based array index for use with Cypress `.eq()`.
 * Throws if the value is not a positive integer.
 */
const toArrayIndex = (oneBased: string | number, fieldName: string): number => {
  const parsed = Number(oneBased);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${fieldName} must be a positive integer. Received: ${oneBased}`);
  }

  return parsed - 1;
};

/**
 * Returns a Cypress chain scoped to the replicate card matching the given replicate number.
 * Selector targets the `.consep-purity-content-replicate` section by its h5 heading text.
 */
export const getPurityReplicateSection = (replicateNumber: string) => cy.contains('.consep-purity-content-replicate h5', `Replicate ${replicateNumber}`)
  .parent();

/**
 * Returns a Cypress chain scoped to a single impurity row within a replicate section.
 * @param replicateNumber {string} - The replicate label as shown in the UI (e.g. "1", "2")
 * @param rank {string} - The 1-based row position as shown in the UI
 */
export const getImpurityRowAt = (replicateNumber: string, rank: string) => getPurityReplicateSection(replicateNumber)
  .find('.consep-impurity-content')
  .eq(toArrayIndex(rank, 'Impurity rank'));
