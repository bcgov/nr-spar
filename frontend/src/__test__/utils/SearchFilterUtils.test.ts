import { describe, expect, it } from 'vitest';

import { endOfDay, filterBuilder, startOfDay } from '../../utils/SearchFilterUtils';

describe('filterBuilder', () => {
  it('builds an empty AND filter when nothing is filled in', () => {
    const filter = filterBuilder()
      .eq('species', undefined)
      .eq('species', null)
      .eq('species', '   ')
      .inList('lots', [])
      .inList('lots', undefined)
      .dateRange('begin', undefined, '')
      .build();
    expect(filter).toEqual({ logic: 'AND', criteria: [] });
  });

  it('trims strings and keeps numbers and booleans, including 0 and false', () => {
    const filter = filterBuilder()
      .eq('species', ' FDI ')
      .eq('requestSkey', 0)
      .eq('crownLand', false)
      .ne('status', 'PND')
      .build();
    expect(filter.criteria).toEqual([
      { field: 'species', operator: 'EQ', values: ['FDI'] },
      { field: 'requestSkey', operator: 'EQ', values: [0] },
      { field: 'crownLand', operator: 'EQ', values: [false] },
      { field: 'status', operator: 'NE', values: ['PND'] }
    ]);
  });

  it('drops blank list entries and skips a list that ends up empty', () => {
    const filter = filterBuilder()
      .inList('lots', [' 00098 ', '', null, '63000'])
      .inList('types', ['  ', undefined])
      .build();
    expect(filter.criteria).toEqual([
      { field: 'lots', operator: 'IN', values: ['00098', '63000'] }
    ]);
  });

  it('expands date ranges to whole days, either end optional', () => {
    const filter = filterBuilder()
      .dateRange('begin', '2025-01-01', '2025-01-31T10:00:00')
      .dateRange('end', undefined, '2025-02-01')
      .build();
    expect(filter.criteria).toEqual([
      { field: 'begin', operator: 'GTE', values: ['2025-01-01T00:00:00'] },
      { field: 'begin', operator: 'LTE', values: ['2025-01-31T23:59:59.999'] },
      { field: 'end', operator: 'LTE', values: ['2025-02-01T23:59:59.999'] }
    ]);
  });

  it('supports text operators, raw criteria, nested groups and OR', () => {
    const orGroup = {
      logic: 'OR' as const,
      criteria: [{ field: 'a', operator: 'EQ' as const, values: [1] }]
    };
    const filter = filterBuilder()
      .startsWith('lot', 'F')
      .contains('comment', 'mould')
      .add({ field: 'orchards', operator: 'EXISTS' })
      .group(orGroup)
      .build('OR');
    expect(filter).toEqual({
      logic: 'OR',
      criteria: [
        { field: 'lot', operator: 'STARTS_WITH', values: ['F'] },
        { field: 'comment', operator: 'CONTAINS', values: ['mould'] },
        { field: 'orchards', operator: 'EXISTS' }
      ],
      groups: [orGroup]
    });
  });

  it('start and end of day ignore any time part', () => {
    expect(startOfDay('2025-03-04T15:00:00Z')).toBe('2025-03-04T00:00:00');
    expect(endOfDay('2025-03-04')).toBe('2025-03-04T23:59:59.999');
  });
});
