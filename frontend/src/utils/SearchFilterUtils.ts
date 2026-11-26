import {
  SearchCriterion, SearchFilterGroup
} from '../types/SearchTypes';

type Value = string | number | boolean;

/** Trims strings; returns undefined for null, undefined and blank strings. */
const clean = (value: Value | null | undefined): Value | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }
  return value;
};

/** `YYYY-MM-DD...` -> first moment of that day (local date-time, no zone). */
export const startOfDay = (date: string) => `${date.slice(0, 10)}T00:00:00`;

/** `YYYY-MM-DD...` -> last moment of that day (local date-time, no zone). */
export const endOfDay = (date: string) => `${date.slice(0, 10)}T23:59:59.999`;

/**
 * Builds a standard search filter from form values. Every method skips blank
 * input (undefined, null, empty or whitespace-only strings, empty lists), so a
 * screen can pass its form fields straight in and only filled-in fields become
 * criteria. Screen-specific rules (upper-casing, splitting a value, default
 * filters) stay in the screen's own filter function.
 *
 * @example
 * const f = filterBuilder();
 * f.inList('seedlotDisplay', form.lotNumbers);
 * f.eq('species', form.species);
 * f.dateRange('actualBeginDtTm', form.from, form.to);
 * return f.build();
 */
export const filterBuilder = () => {
  const criteria: SearchCriterion[] = [];
  const groups: SearchFilterGroup[] = [];

  const single = (field: string, operator: SearchCriterion['operator'], value?: Value | null) => {
    const v = clean(value);
    if (v !== undefined) criteria.push({ field, operator, values: [v] });
  };

  const builder = {
    eq: (field: string, value?: Value | null) => {
      single(field, 'EQ', value);
      return builder;
    },
    ne: (field: string, value?: Value | null) => {
      single(field, 'NE', value);
      return builder;
    },
    startsWith: (field: string, value?: string | null) => {
      single(field, 'STARTS_WITH', value);
      return builder;
    },
    contains: (field: string, value?: string | null) => {
      single(field, 'CONTAINS', value);
      return builder;
    },
    inList: (field: string, values?: (Value | null | undefined)[] | null) => {
      const cleaned = (values ?? []).map(clean).filter((v): v is Value => v !== undefined);
      if (cleaned.length) criteria.push({ field, operator: 'IN', values: cleaned });
      return builder;
    },
    /** Whole days: `from` counts from the start of its day, `to` up to the end of its day. */
    dateRange: (field: string, from?: string | null, to?: string | null) => {
      const start = clean(from);
      const end = clean(to);
      if (start !== undefined) single(field, 'GTE', startOfDay(String(start)));
      if (end !== undefined) single(field, 'LTE', endOfDay(String(end)));
      return builder;
    },
    /** Adds a criterion as is, for anything the helpers above don't cover. */
    add: (criterion: SearchCriterion) => {
      criteria.push(criterion);
      return builder;
    },
    /** Adds a nested group, e.g. an OR of alternatives. */
    group: (group: SearchFilterGroup) => {
      groups.push(group);
      return builder;
    },
    build: (logic: 'AND' | 'OR' = 'AND'): SearchFilterGroup => ({
      logic,
      criteria: [...criteria],
      ...(groups.length ? { groups: [...groups] } : {})
    })
  };

  return builder;
};
