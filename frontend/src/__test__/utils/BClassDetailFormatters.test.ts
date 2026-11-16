import {
  formatBecZone,
  formatDmsWithHemisphere,
  formatOptionalNumber,
  formatOptionalString,
  formatYesNo
} from '../../views/Seedlot/SeedlotDetails/sections/bClass/utils';
import { PLACE_HOLDER } from '../../shared-constants/shared-constants';

describe('B-class seedlot detail formatters', () => {
  it('formats degrees, minutes and seconds with an optional hemisphere', () => {
    expect(formatDmsWithHemisphere(49, 10, 5, 'N')).toBe('49° 10\' 5" N');
    expect(formatDmsWithHemisphere(49, 10, 5, null)).toBe('49° 10\' 5"');
    expect(formatDmsWithHemisphere(49, null, 5, 'N')).toBe(PLACE_HOLDER);
  });

  it('formats a BEC zone with its description when available', () => {
    expect(formatBecZone('CWH', 'Coastal Western Hemlock')).toBe('CWH - Coastal Western Hemlock');
    expect(formatBecZone('CWH', null)).toBe('CWH');
    expect(formatBecZone(undefined, 'ignored')).toBe(PLACE_HOLDER);
  });

  it('formats optional numbers', () => {
    expect(formatOptionalNumber(0)).toBe('0');
    expect(formatOptionalNumber(null)).toBe(PLACE_HOLDER);
  });

  it('formats yes/no flags', () => {
    expect(formatYesNo(true)).toBe('Yes');
    expect(formatYesNo(false)).toBe('No');
    expect(formatYesNo(undefined)).toBe(PLACE_HOLDER);
  });

  it('formats optional strings', () => {
    expect(formatOptionalString('Lake')).toBe('Lake');
    expect(formatOptionalString('')).toBe(PLACE_HOLDER);
    expect(formatOptionalString(null)).toBe(PLACE_HOLDER);
  });
});
