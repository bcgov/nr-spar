/**
 * This function creates a new empty replicate list for
 * testing activities
 *
 * @param {string} activityRiaKey the activity riakey to generate the list
 * @returns {any} a list of empty rows
 */
export const initReplicatesList = (activityRiaKey: string): any => {
  const emptyRows = [];
  for (let i = 0; i < 4; i += 1) {
    emptyRows.push({
      riaKey: activityRiaKey,
      replicateNumber: i + 1,
      replicateAccInd: 1
    });
  }
  return emptyRows;
};
