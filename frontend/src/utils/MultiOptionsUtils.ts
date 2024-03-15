import { EmptyMultiOptObj } from '../shared-constants/shared-constants';
import MultiOptionsObj from '../types/MultiOptionsObject';

const multiOptionsItem: MultiOptionsObj = EmptyMultiOptObj;

const capFirstChar = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const uncapFirstChar = (str: string) => str.charAt(0).toLowerCase() + str.slice(1);

const createCheckboxLabel = (str1: string, str2: string) => {
  const strArray = str1.split(' ');
  return uncapFirstChar(strArray[0]) + str2;
};

const trimExtraSpaces = (str: string) => str.replace(/\s\s+/g, ' ');

export const sortAlphabetically = (
  a: MultiOptionsObj,
  b: MultiOptionsObj,
  orderByDescription: boolean = false
) => {
  if (orderByDescription) {
    return a.description.toLocaleLowerCase() < b.description.toLocaleLowerCase()
      ? -1
      : 1;
  }
  return a.label.toLocaleLowerCase() < b.label.toLocaleLowerCase()
    ? -1
    : 1;
};

export const getCheckboxOptions = (
  dataList: any
) => {
  const resultList: Array<MultiOptionsObj> = [];

  dataList.forEach((data: any) => {
    const newItem = structuredClone(multiOptionsItem);
    newItem.code = data.code;
    newItem.description = data.description;
    newItem.label = createCheckboxLabel(data.description, data.code);
    resultList.push(newItem);
  });

  resultList.sort((a, b) => sortAlphabetically(a, b, true));

  return resultList;
};

export const getMultiOptList = (
  dataList: any,
  toCapFirstChar: boolean = true,
  toTrimExtraSpaces: boolean = false,
  insertProperty: boolean = false,
  additionalProperties: string[] = []
) => {
  const resultList: Array<MultiOptionsObj> = [];

  dataList.forEach((data: any) => {
    const newItem = structuredClone(multiOptionsItem);
    newItem.code = data.code;
    newItem.description = data.description;
    if (toCapFirstChar) {
      newItem.description = capFirstChar(newItem.description);
    }
    if (toTrimExtraSpaces) {
      newItem.description = trimExtraSpaces(newItem.description);
    }
    if (insertProperty) {
      additionalProperties.forEach((property) => {
        Object.assign(newItem, {
          [property]: data[property]
        });
      });
    }
    newItem.label = `${newItem.code} - ${newItem.description}`;
    resultList.push(newItem);
  });

  resultList.sort((a, b) => sortAlphabetically(a, b));

  return resultList;
};
