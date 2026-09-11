import { describe, expect, it } from 'vitest';

import {
  cqlIntegerInList,
  cqlQuoted,
  cqlQuotedInList,
  filterCqlSafeIdentifiers,
  isCqlSafeIdentifier
} from '../../utils/CqlUtils';
import { parseBecZoneCamelCaseParam, parseBecZoneParam } from '../../legacy_translated/SPR_SPATIAL_UTILS';
import { escapeHtml, safeCssColor } from '../../views/Seedlot/SeedlotMap/printMap';
import { MAX_IMPORT_FEATURES, MAX_IMPORT_VERTICES, importShapeFile } from '../../views/Seedlot/SeedlotMap/AoiToolbar/importShape';

describe('CqlUtils', () => {
  it('doubles single quotes in string literals', () => {
    expect(cqlQuoted("O'Brien")).toBe("'O''Brien'");
    expect(cqlQuotedInList(['IDF', "MH'"])).toBe("'IDF','MH'''");
  });

  it('drops non-integers from a numeric IN-list', () => {
    expect(cqlIntegerInList([1284, 1342])).toBe('1284,1342');
    expect(cqlIntegerInList([1, 2.5, Number.NaN, 3])).toBe('1,3');
    expect(() => cqlIntegerInList([1.2, Number.NaN])).toThrow(/No valid integer/);
  });

  it('rejects identifiers that could break out of a CQL literal', () => {
    expect(isCqlSafeIdentifier('IDFmw1')).toBe(true);
    expect(isCqlSafeIdentifier('FDC')).toBe(true);
    expect(isCqlSafeIdentifier("IDF' OR 1=1")).toBe(false);
    expect(isCqlSafeIdentifier('ZONE IN (')).toBe(false);
    expect(filterCqlSafeIdentifiers(['IDF', "bad'code", '', 'CWH'])).toEqual(['IDF', 'CWH']);
  });
});

describe('parseBecZoneParam sanitizes codes', () => {
  it('keeps valid codes and the not-suitable flag', () => {
    expect(parseBecZoneParam('IDF,MH_,SBS')).toEqual({
      codes: ['IDF', 'MH', 'SBS'],
      notSuit: ['MH']
    });
  });

  it('drops codes that are not identifiers', () => {
    expect(parseBecZoneParam("IDF,ZONE='x',CWH")).toEqual({
      codes: ['IDF', 'CWH'],
      notSuit: []
    });
  });

  it('rejects a hostile camelCase becZone', () => {
    expect(parseBecZoneCamelCaseParam("IDFmw1';DROP")).toEqual({ code: '' });
    expect(parseBecZoneCamelCaseParam('IDFmw1')).toEqual({ code: 'IDFmw1' });
  });
});

describe('printMap HTML escaping', () => {
  it('escapes markup in text and attributes', () => {
    expect(escapeHtml(`<img src=x onerror="alert(1)">`)).toBe(
      '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'
    );
  });

  it('rejects CSS colours that could break a style attribute', () => {
    expect(safeCssColor('#D5C262', '#000')).toBe('#D5C262');
    expect(safeCssColor('red', '#000')).toBe('red');
    expect(safeCssColor('rgb(1, 2, 3)', '#000')).toBe('rgb(1, 2, 3)');
    expect(safeCssColor('red;width:99%', '#000')).toBe('#000');
    expect(safeCssColor('" onclick=alert(1)', '#000')).toBe('#000');
  });
});

describe('importShape feature and vertex caps', () => {
  const makeFile = (name: string, contents: string): File => {
    const file = new File([contents], name, { type: 'application/geo+json' });
    if (typeof file.text !== 'function') {
      Object.defineProperty(file, 'text', {
        configurable: true,
        value: async () => contents
      });
    }
    return file;
  };

  const polygon = (lng: number) => ({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [lng, 48], [lng + 0.1, 48], [lng + 0.1, 49], [lng, 49], [lng, 48]
      ]]
    }
  });

  it('rejects more polygons than MAX_IMPORT_FEATURES', async () => {
    const features = Array.from({ length: MAX_IMPORT_FEATURES + 1 }, (_, i) => polygon(-123 + i));
    await expect(importShapeFile(makeFile(
      'many.geojson',
      JSON.stringify({ type: 'FeatureCollection', features })
    ))).rejects.toThrow(/too many polygons/i);
  });

  it('rejects more vertices than MAX_IMPORT_VERTICES', async () => {
    const ring = Array.from({ length: MAX_IMPORT_VERTICES + 2 }, (_, i) => [i, i]);
    ring.push(ring[0]);
    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon', coordinates: [ring] }
    };
    await expect(importShapeFile(makeFile('dense.geojson', JSON.stringify(geojson))))
      .rejects.toThrow(/too many vertices/i);
  });
});
