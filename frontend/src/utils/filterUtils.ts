export interface FilterObj {
    item: string,
    inputValue: string,
  }

export const filterInput = ({ item, inputValue }: FilterObj) => {
  if (inputValue === null) {
    return true;
  }
  return item.toLowerCase().includes(inputValue.toLowerCase());
};
