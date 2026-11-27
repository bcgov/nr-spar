/**
 * Types for the standard paginated search contract used by
 * `POST /api/{resource}/search` endpoints.
 */

export type SearchOperator =
  | 'EQ' | 'NE' | 'IN'
  | 'GT' | 'GTE' | 'LT' | 'LTE' | 'BETWEEN'
  | 'CONTAINS' | 'STARTS_WITH'
  | 'IS_NULL' | 'IS_NOT_NULL'
  // Child collections only: use with `where`.
  | 'EXISTS' | 'NOT_EXISTS';

export type SearchCriterion<F extends string = string> = {
  /** A field name, or a child collection name when using EXISTS / NOT_EXISTS. */
  field: F,
  operator: SearchOperator,
  values?: (string | number | boolean)[],
  /**
   * EXISTS / NOT_EXISTS only: conditions on the child's own fields that must all
   * match the same child row. Omit to test whether any child row exists.
   */
  where?: SearchFilterGroup<string>
};

export type SearchFilterGroup<F extends string = string> = {
  logic?: 'AND' | 'OR',
  criteria?: SearchCriterion<F>[],
  groups?: SearchFilterGroup<F>[]
};

export type SearchSortOrder<F extends string = string> = {
  field: F,
  direction?: 'ASC' | 'DESC'
};

export type SearchRequest<F extends string = string> = {
  filter?: SearchFilterGroup<F>,
  sort?: SearchSortOrder<F>[],
  /** Zero-based page number. */
  page?: number,
  /** Page size, max 100. */
  size?: number,
  /**
   * Return every match in one response, ignoring page and size (e.g. for exports).
   * Only on searches that allow it; results over that search's row limit are a 400.
   */
  unpaged?: boolean
};

export type PageResponse<T> = {
  content: T[],
  page: {
    number: number,
    size: number,
    totalElements: number,
    totalPages: number
  }
};
