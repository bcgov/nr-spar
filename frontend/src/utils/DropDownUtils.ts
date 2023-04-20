import DropDownObj from '../types/DropDownObject';

const dropDownItem: DropDownObj = {
  label: '',
  code: '',
  description: ''
};

export const sortAlphabetically = (a: DropDownObj, b: DropDownObj) => (
  a.label.toLocaleLowerCase() < b.label.toLocaleLowerCase()
    ? -1
    : 1
);

export const getDropDownList = (dataList: any) => {
  const resultList: Array<DropDownObj> = [];

  dataList.forEach((data: any) => {
    const newItem = { ...dropDownItem };
    newItem.code = data.code;
    newItem.description = data.description;
    newItem.label = `${data.code} - ${data.description}`;
    resultList.push(newItem);
  });

  resultList.sort((a, b) => sortAlphabetically(a, b));

  return resultList;
};
