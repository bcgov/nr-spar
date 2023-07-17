import PaginationChangeType from '../types/PaginationChangeType';

// Sort array by sortByField in ASCENDING order
const sortRowItems = (rows: Array<any>, sortByField: string) => (
  rows.sort((a: any, b: any) => Number(a[sortByField]) - Number(b[sortByField]))
);

// Slice row data for pagination
const sliceRowItems = (rows: Array<any>, pageNumber: number, pageSize: number) => (
  rows.slice((pageNumber - 1) * pageSize).slice(0, pageSize)
);

export const sortAndSliceRows = (
  rows: Array<any>,
  pageNumber: number,
  pageSize: number,
  sliceOnly: boolean,
  sortByField: string
) => {
  let sorted = rows;
  if (!sliceOnly) {
    sorted = sortRowItems(rows, sortByField);
  }
  const sliced = sliceRowItems(sorted, pageNumber, pageSize);
  return sliced;
};

export const sliceTableRowData = (
  rows: Array<any>,
  pageNumber: number,
  pageSize: number,
  sliceOnly: boolean,
  sortByField: string,
  setRows: Function
) => {
  let sorted = rows;
  if (!sliceOnly) {
    sorted = sortRowItems(rows, sortByField);
  }
  const sliced = sliceRowItems(sorted, pageNumber, pageSize);
  setRows(sliced);
};

export const handlePagination = (
  paginationObj: PaginationChangeType,
  setCurrentPage: Function,
  setCurrPageSize: Function,
  tableData: Array<any>,
  sliceOnly: boolean,
  sortByField: string,
  setRows: Function
) => {
  const { page, pageSize } = paginationObj;
  setCurrentPage(page);
  setCurrPageSize(pageSize);
  sliceTableRowData(tableData, page, pageSize, sliceOnly, sortByField, setRows);
};
