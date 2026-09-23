import React from 'react';

type PaginationChangeType = {
  page: number;
  pageSize: number;
  backBtnRef?: React.RefObject<HTMLElement | null>;
  forwardBtnRef?: React.RefObject<HTMLElement | null>;
}

export default PaginationChangeType;
