/* eslint-disable no-undef */
import { toActivitySearchFilter } from '../../api-service/consep/searchTestingActivitiesAPI';

const criteriaOf = (form: Parameters<typeof toActivitySearchFilter>[0]) => (
  toActivitySearchFilter(form).criteria ?? []
);

describe('toActivitySearchFilter', () => {
  it('returns no criteria for an empty form', () => {
    const filter = toActivitySearchFilter({});
    expect(filter.criteria).toEqual([]);
    expect(filter.groups).toBeUndefined();
  });

  it('upper-cases lot numbers and test types and drops blanks', () => {
    expect(criteriaOf({ lotNumbers: ['f2008', ' ', '00098'], testTypes: ['ger', ''] })).toEqual([
      { field: 'seedlotDisplay', operator: 'IN', values: ['F2008', '00098'] },
      { field: 'activityTypeCd', operator: 'IN', values: ['GER'] }
    ]);
  });

  it('splits a 12 character request id into request and item', () => {
    expect(criteriaOf({ requestId: 'RTS19981299A' })).toEqual([
      { field: 'reqId', operator: 'EQ', values: ['RTS19981299'] },
      { field: 'itemId', operator: 'EQ', values: ['A'] }
    ]);
    expect(criteriaOf({ requestId: 'RTS19981299' })).toEqual([
      { field: 'reqId', operator: 'EQ', values: ['RTS19981299'] }
    ]);
  });

  it('maps the seedlot class selection to geneticClassCode', () => {
    expect(criteriaOf({ seedlotClass: 'A' })).toEqual([
      { field: 'geneticClassCode', operator: 'EQ', values: ['A'] }
    ]);
  });

  it('only hides historical tests when explicitly unticked', () => {
    expect(criteriaOf({ includeHistoricalTests: true })).toEqual([]);
    expect(criteriaOf({})).toEqual([]);
    expect(criteriaOf({ includeHistoricalTests: false })).toEqual([
      { field: 'requestSkey', operator: 'NE', values: [0] }
    ]);
  });

  it('maps germ-tests-only and indicator groups', () => {
    expect(criteriaOf({ germTestsOnly: true, completeStatus: 0, acceptanceStatus: -1 })).toEqual([
      { field: 'testCompleteInd', operator: 'EQ', values: [0] },
      { field: 'acceptResultInd', operator: 'EQ', values: [-1] },
      { field: 'germTestInd', operator: 'EQ', values: [-1] }
    ]);
  });

  it('family lots only becomes a starts-with F (the server ignores case)', () => {
    expect(criteriaOf({ familyLotsOnly: true })).toEqual([
      { field: 'seedlotDisplay', operator: 'STARTS_WITH', values: ['F'] }
    ]);
  });

  it('expands date ranges to start and end of day', () => {
    expect(criteriaOf({ actualBeginDateFrom: '2025-01-01', actualBeginDateTo: '2025-01-31' })).toEqual([
      { field: 'actualBeginDtTm', operator: 'GTE', values: ['2025-01-01T00:00:00'] },
      { field: 'actualBeginDtTm', operator: 'LTE', values: ['2025-01-31T23:59:59.999'] }
    ]);
  });
});
