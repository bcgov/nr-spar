import {
  buildDrybackPayload, calculateDryback, formFromData, parseNumber, validateDryback
} from '../../../views/CONSEP/TestingActivities/GerminationContent/dryback';
import { DrybackScreenType } from '../../../types/consep/DrybackType';

// The legacy CONSEP screen in the spec: StWt400 17.812, Storage MC 7.6, Imbibed 26.438,
// Dryback 25.080 -> ODWT 16.458, Dryback MC 34.4, 30% 23.512, 35% 25.320.
const legacy: DrybackScreenType = {
  riaSkey: 1,
  actualBeginDateTime: '2025-05-10T08:30:00',
  actualEndDateTime: '2025-05-12T16:00:00',
  dryWeight: 17.812,
  imbibedWeight: 26.438,
  drybackWeight: 25.08,
  drybackMoist: null,
  drybackTime: 65,
  storageMc: 7.6,
  updateTimestamp: '2025-05-12T16:00:00'
};

const empty: DrybackScreenType = { riaSkey: 1, storageMc: 7.6, updateTimestamp: '2025-01-01T00:00:00' };
const TODAY = '2026-11-26';

describe('dryback calculations', () => {
  it('reproduces the legacy screen values', () => {
    const calc = calculateDryback(formFromData(legacy), legacy.storageMc);
    expect(calc.odwt!.toFixed(3)).toBe('16.458');
    expect(calc.drybackMoist!.toFixed(1)).toBe('34.4');
    expect(calc.imbibedMoist!.toFixed(1)).toBe('37.7');
    expect(calc.targetThirtyMoist!.toFixed(3)).toBe('23.512');
    expect(calc.targetThirtyFiveMoist!.toFixed(3)).toBe('25.320');
  });

  it('calculates nothing without a storage MC or StWt400', () => {
    expect(calculateDryback(formFromData(legacy), null)).toEqual({
      odwt: undefined,
      imbibedMoist: undefined,
      drybackMoist: undefined,
      targetThirtyMoist: undefined,
      targetThirtyFiveMoist: undefined
    });
    expect(calculateDryback({ ...formFromData(legacy), dryWeight: '' }, 7.6).odwt).toBeUndefined();
  });

  it('parses only plain non-negative numbers', () => {
    expect(parseNumber(' ')).toBeNull();
    expect(parseNumber('12.5')).toBe(12.5);
    expect(parseNumber('.5')).toBe(0.5);
    expect(parseNumber('-1')).toBeNaN();
    expect(parseNumber('1e3')).toBeNaN();
    expect(parseNumber('.')).toBeNaN();
  });
});

describe('dryback form', () => {
  it('defaults empty dates to 27 days after the cold strat start', () => {
    const form = formFromData(empty, '2026-10-01');
    expect(form.beginDate).toBe('2026-10-28');
    expect(form.endDate).toBe('2026-10-28');
    expect(formFromData(legacy, '2026-10-01').beginDate).toBe('2025-05-10');
    const startOnly = { ...empty, actualBeginDateTime: '2026-10-05T09:00:00' };
    expect(formFromData(startOnly, '2026-10-01').endDate).toBeUndefined();
  });

  it('requires a start date once anything else is entered', () => {
    const form = { ...formFromData(empty), drybackTime: '10' };
    expect(validateDryback(form, empty, calculateDryback(form, 7.6), TODAY).beginDate).toBeDefined();
    expect(validateDryback(formFromData(empty), empty, {}, TODAY)).toEqual({});
  });

  it('rejects out-of-range values, future dates and an end before the start', () => {
    const form = {
      ...formFromData(legacy),
      drybackMoist: '100',
      drybackTime: '1.5',
      beginDate: '2025-05-12',
      endDate: '2025-05-11'
    };
    const errors = validateDryback(form, legacy, calculateDryback(form, 7.6), TODAY);
    expect(Object.keys(errors).sort()).toEqual(['drybackMoist', 'drybackTime', 'endDate']);
    const future = { ...formFromData(legacy), endDate: '2026-11-27' };
    expect(validateDryback(future, legacy, {}, TODAY).endDate).toBeDefined();
  });

  it('flags a target weight over the column limit', () => {
    const form = { ...formFromData(empty), beginDate: '2025-01-01', dryWeight: '80' };
    const errors = validateDryback(form, empty, calculateDryback(form, 7.6), TODAY);
    expect(errors.targetThirtyMoist).toBeDefined();
    expect(errors.targetThirtyFiveMoist).toBeDefined();
  });

  it('builds the full PUT body, keeping stored times and rounding targets', () => {
    const form = { ...formFromData(legacy), endDate: '2025-05-13', riaComment: '' };
    expect(buildDrybackPayload(form, legacy, calculateDryback(form, 7.6))).toEqual({
      actualBeginDateTime: '2025-05-10T08:30:00',
      actualEndDateTime: '2025-05-13T16:00:00',
      drybackMoist: null,
      imbibedWeight: 26.438,
      drybackWeight: 25.08,
      dryWeight: 17.812,
      drybackTime: 65,
      targetThirtyMoist: 23.512,
      targetThirtyFiveMoist: 25.32,
      stratEndWeight: null,
      riaComment: null
    });
  });

  it('keeps the stored targets when there is no storage MC to recalculate from', () => {
    const noMc = {
      ...legacy, storageMc: null, targetThirtyMoist: 1.5, targetThirtyFiveMoist: 2.5
    };
    const form = formFromData(noMc);
    const payload = buildDrybackPayload(form, noMc, calculateDryback(form, null));
    expect(payload.targetThirtyMoist).toBe(1.5);
    expect(payload.targetThirtyFiveMoist).toBe(2.5);
  });
});
