const paginationOnChange = (
  pageSize: number,
  currentPageSize: number,
  page: number,
  setCurrent: Function,
  setFirst: Function
) => {
  if (pageSize !== currentPageSize) {
    setCurrent(pageSize);
  }
  setFirst(pageSize * (page - 1));
};

export default paginationOnChange;
