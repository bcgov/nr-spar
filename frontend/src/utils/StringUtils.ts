/**
 * This funtion deals with the forest client string and returns only the
 * client number
 *
 * @param {string} forestClient information of the forest client, containing number
 *                              name and acronym
 * @returns {string} the forest client number
 */
const getForestClientNumber = (forestClient: string): string => forestClient.substring(0, forestClient.indexOf('-')).trim();

export default getForestClientNumber;
