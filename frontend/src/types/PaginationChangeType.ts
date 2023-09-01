import React from 'react';

type PaginationChangeType = {
  page: number;
  pageSize: number;
  backBtnRef?: React.RefObject<HTMLElement>;
  forwardBtnRef?: React.RefObject<HTMLElement>;
}

export default PaginationChangeType;
