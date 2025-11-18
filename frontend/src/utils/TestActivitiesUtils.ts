/**
 * This function creates a new empty replicate list for
 * testing activities
 *
 * @param {string} activityRiaKey the activity riakey to generate the list
 * @returns {any} a list of empty rows
 */
export const initReplicatesList = (activityRiaKey: string, numberOfRows: number): any => {
  const emptyRows = [];
  for (let i = 0; i < numberOfRows; i += 1) {
    emptyRows.push({
      riaKey: activityRiaKey,
      replicateNumber: i + 1,
      replicateAccInd: 1,
      containerId: '',
      containerWeight: undefined,
      freshSeed: undefined,
      containerAndDryWeight: undefined,
      dryWeight: undefined,
      mcValue: undefined,
      replicateComment: ''
    });
  }
  return emptyRows;
};
