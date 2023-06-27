import MultiOptionsObj from '../types/MultiOptionsObject';

export type FilterObj = {
  item: string | MultiOptionsObj,
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
