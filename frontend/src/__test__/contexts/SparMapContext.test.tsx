import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SparMapProvider, useSparMap } from '../../contexts/SparMapContext';
import type { AoiPolygon } from '../../types/SparMapTypes';

const wrapper = ({ children }: { children: ReactNode }) => (
  <SparMapProvider>{children}</SparMapProvider>
);

const makePolygon = (offset: number): AoiPolygon => ({
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [offset, offset],
      [offset + 1, offset],
      [offset + 1, offset + 1],
      [offset, offset + 1],
      [offset, offset]
    ]]
  },
  properties: {}
});

describe('SparMapContext', () => {
  it('throws when useSparMap is called outside the provider', () => {
    expect(() => renderHook(() => useSparMap())).toThrow(
      /must be used inside SparMapProvider/
    );
  });

  it('initializes with an empty AOI list and empty BEC zone arrays', () => {
    const { result } = renderHook(() => useSparMap(), { wrapper });
    expect(result.current.aois).toEqual([]);
    expect(result.current.becZoneCodes).toEqual([]);
    expect(result.current.becNotSuit).toEqual([]);
  });

  it('exposes a noop addImportedLayersToMap callback before AoiDrawLayer mounts', () => {
    const { result } = renderHook(() => useSparMap(), { wrapper });
    expect(typeof result.current.addImportedLayersToMap).toBe('function');
    // Calling the noop should not throw even with polygons present.
    expect(() =>
      result.current.addImportedLayersToMap([makePolygon(0)])
    ).not.toThrow();
  });

  it('gates markup point callbacks before MarkupPointLayer mounts', () => {
    const { result } = renderHook(() => useSparMap(), { wrapper });
    expect(result.current.startDrawPoint).toBeNull();
    expect(result.current.clearMarkupPoints).toBeNull();
  });

  it('appends polygons via addAoi and preserves insertion order', () => {
    const { result } = renderHook(() => useSparMap(), { wrapper });
    const first = makePolygon(0);
    const second = makePolygon(10);
    act(() => {
      result.current.addAoi(first);
      result.current.addAoi(second);
    });
    expect(result.current.aois).toEqual([first, second]);
  });

  it('removeLastAoi pops only the most recent polygon', () => {
    const { result } = renderHook(() => useSparMap(), { wrapper });
    const first = makePolygon(0);
    const second = makePolygon(10);
    act(() => {
      result.current.addAoi(first);
      result.current.addAoi(second);
      result.current.removeLastAoi();
    });
    expect(result.current.aois).toEqual([first]);
  });

  it('clearAois wipes the entire AOI list', () => {
    const { result } = renderHook(() => useSparMap(), { wrapper });
    act(() => {
      result.current.addAoi(makePolygon(0));
      result.current.addAoi(makePolygon(10));
      result.current.clearAois();
    });
    expect(result.current.aois).toEqual([]);
  });

  it('replaceAoi swaps a polygon at the given index', () => {
    const { result } = renderHook(() => useSparMap(), { wrapper });
    const first = makePolygon(0);
    const second = makePolygon(10);
    const replacement = makePolygon(20);
    act(() => {
      result.current.addAoi(first);
      result.current.addAoi(second);
      result.current.replaceAoi(0, replacement);
    });
    expect(result.current.aois).toEqual([replacement, second]);
  });

  it('updates BEC zones via setBecZones', () => {
    const { result } = renderHook(() => useSparMap(), { wrapper });
    act(() => {
      result.current.setBecZones(['IDF', 'MH', 'SBS'], ['MH']);
    });
    expect(result.current.becZoneCodes).toEqual(['IDF', 'MH', 'SBS']);
    expect(result.current.becNotSuit).toEqual(['MH']);
  });

  it('keeps setter identities stable across renders (useCallback guarantees)', () => {
    const { result, rerender } = renderHook(() => useSparMap(), { wrapper });
    const firstAdd = result.current.addAoi;
    const firstClear = result.current.clearAois;
    const firstSetBec = result.current.setBecZones;
    rerender();
    expect(result.current.addAoi).toBe(firstAdd);
    expect(result.current.clearAois).toBe(firstClear);
    expect(result.current.setBecZones).toBe(firstSetBec);
  });

  it('exposes becZoneShape="zone" by default', () => {
    const { result } = renderHook(() => useSparMap(), { wrapper });
    expect(result.current.becZoneShape).toBe('zone');
  });

  it('setBecZones can set shape to mapLabel', () => {
    const { result } = renderHook(() => useSparMap(), { wrapper });
    act(() => {
      result.current.setBecZones(['IDFmw1'], [], 'mapLabel');
    });
    expect(result.current.becZoneShape).toBe('mapLabel');
    expect(result.current.becZoneCodes).toEqual(['IDFmw1']);
  });

  it('setBecZones called with 2 args resets shape to "zone"', () => {
    const { result } = renderHook(() => useSparMap(), { wrapper });
    act(() => {
      result.current.setBecZones(['IDFmw1'], [], 'mapLabel');
    });
    expect(result.current.becZoneShape).toBe('mapLabel');
    act(() => {
      result.current.setBecZones(['IDF'], []);
    });
    expect(result.current.becZoneShape).toBe('zone');
  });

  it('initializes the URL-driven highlight fields to null/empty', () => {
    const { result } = renderHook(() => useSparMap(), { wrapper });
    expect(result.current.extentBounds).toBeNull();
    expect(result.current.seedlotNumber).toBeNull();
    expect(result.current.veglotNumber).toBeNull();
    expect(result.current.spzIds).toEqual([]);
    expect(result.current.spzCode).toBeNull();
    expect(result.current.speciesCode).toBeNull();
  });

  it('setExtentBounds round-trips a LatLngBoundsExpression', () => {
    const { result } = renderHook(() => useSparMap(), { wrapper });
    const bounds: [[number, number], [number, number]] = [
      [50.0, -120.0],
      [51.0, -119.0],
    ];
    act(() => {
      result.current.setExtentBounds(bounds);
    });
    expect(result.current.extentBounds).toEqual(bounds);
    act(() => {
      result.current.setExtentBounds(null);
    });
    expect(result.current.extentBounds).toBeNull();
  });

  it('setHighlightPoint enforces seedlot-wins mutual exclusivity', () => {
    const { result } = renderHook(() => useSparMap(), { wrapper });
    act(() => {
      result.current.setHighlightPoint('04404', '99999');
    });
    expect(result.current.seedlotNumber).toBe('04404');
    expect(result.current.veglotNumber).toBeNull();
    act(() => {
      result.current.setHighlightPoint(null, '99999');
    });
    expect(result.current.seedlotNumber).toBeNull();
    expect(result.current.veglotNumber).toBe('99999');
    act(() => {
      result.current.setHighlightPoint(null, null);
    });
    expect(result.current.seedlotNumber).toBeNull();
    expect(result.current.veglotNumber).toBeNull();
  });

  it('setSpzIds round-trips a number array', () => {
    const { result } = renderHook(() => useSparMap(), { wrapper });
    act(() => {
      result.current.setSpzIds([1284, 1342]);
    });
    expect(result.current.spzIds).toEqual([1284, 1342]);
  });

  it('setSpzCode and setSpeciesCode round-trip parity-only string values', () => {
    const { result } = renderHook(() => useSparMap(), { wrapper });
    act(() => {
      result.current.setSpzCode('M');
      result.current.setSpeciesCode('FDC');
    });
    expect(result.current.spzCode).toBe('M');
    expect(result.current.speciesCode).toBe('FDC');
  });
});
