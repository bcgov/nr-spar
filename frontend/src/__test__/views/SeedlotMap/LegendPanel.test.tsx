import { useEffect } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import LegendPanel, { swatchStyle } from '../../../views/Seedlot/SeedlotMap/LegendPanel';
import { SparMapProvider, useSparMap } from '../../../contexts/SparMapContext';
import type { LegendOverlayData, LegendSwatch } from '../../../api-service/legendApi';

const polygonSwatch: LegendSwatch = {
  geometry: 'polygon',
  fill: '#E6E600',
  fillOpacity: 0.65,
  stroke: '#ff6500',
  strokeWidth: 1,
  strokeOpacity: 0.65
};

describe('LegendPanel swatchStyle', () => {
  it('renders a polygon swatch as a filled, bordered square', () => {
    const style = swatchStyle(polygonSwatch);
    expect(style.backgroundColor).toBe('#E6E600');
    expect(style.border).toBe('1px solid #ff6500');
    expect(style.borderRadius).toBe(2);
  });

  it('renders a point swatch as a circle', () => {
    const style = swatchStyle({ ...polygonSwatch, geometry: 'point' });
    expect(style.borderRadius).toBe('50%');
  });

  it('renders a line swatch as a colored rule', () => {
    const style = swatchStyle({
      geometry: 'line', fill: null, fillOpacity: 0, stroke: '#1f6fdb', strokeWidth: 3, strokeOpacity: 1
    });
    expect(style.borderTop).toBe('3px solid #1f6fdb');
    expect(style.height).toBe(0);
  });

  it('falls back to neutral colors when fill/stroke are null', () => {
    const style = swatchStyle({
      geometry: 'polygon', fill: null, fillOpacity: 1, stroke: null, strokeWidth: 1, strokeOpacity: 1
    });
    expect(style.backgroundColor).toBe('transparent');
    expect(style.border).toBe('1px solid #888888');
  });
});

const renderPanel = (data: LegendOverlayData[]) => {
  const Bridge = () => {
    const { setLegendData } = useSparMap();
    useEffect(() => {
      setLegendData(data);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
  };
  return render(
    <MemoryRouter>
      <SparMapProvider>
        <Bridge />
        <LegendPanel />
      </SparMapProvider>
    </MemoryRouter>
  );
};

describe('LegendPanel', () => {
  it('shows an empty-state when there is no legend data', () => {
    renderPanel([]);
    expect(screen.getByTestId('legend-panel-empty')).toBeTruthy();
  });

  it('renders an accordion section per overlay with a row per in-view rule', () => {
    renderPanel([
      {
        id: 'spz',
        label: 'SPZ',
        rules: [
          { label: 'Georgia Lowlands', swatch: polygonSwatch },
          { label: 'Maritime', swatch: polygonSwatch }
        ]
      }
    ]);
    expect(screen.getByTestId('legend-panel-item-spz')).toBeTruthy();
    expect(screen.getAllByTestId('legend-panel-row-spz')).toHaveLength(2);
    expect(screen.getByText('Georgia Lowlands')).toBeTruthy();
    expect(screen.getByText('Maritime')).toBeTruthy();
  });
});
