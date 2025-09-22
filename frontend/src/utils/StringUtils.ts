/**
 * This funtion deals with the forest client string and returns only the
 * client number
 *
 * @param {string} forestClient information of the forest client, containing number
 *                              name and acronym
 * @returns {string} the forest client number
 */
export const getForestClientNumber = (forestClient: string): string => forestClient.substring(0, forestClient.indexOf('-')).trim();

/**
 * Capitalizes the first letter of a given string.
 *
 * @param {string} word The input string to capitalize.
 * @returns {string} A new string with the first character in uppercase and the rest unchanged.
 */
export const capitalizeFirstLetter = (word: string): string => {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
};
