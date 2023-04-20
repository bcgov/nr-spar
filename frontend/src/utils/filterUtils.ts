import DropDownObj from '../types/DropDownObject';

export type FilterObj = {
  item: string | DropDownObj,
  inputValue: string,
}

export const filterInput = ({ item, inputValue }: FilterObj) => {
  if (inputValue === null) {
    return true;
  }
  if (typeof item === 'string') {
    return item.toLowerCase().includes(inputValue.toLowerCase());
  }
  return item.label.toLowerCase().includes(inputValue.toLowerCase());
};
