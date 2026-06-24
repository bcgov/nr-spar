import React, { useEffect } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';

import BecZonePanel from '../../../views/Seedlot/SeedlotMap/BecZonePanel';
import { SparMapProvider, useSparMap } from '../../../contexts/SparMapContext';

/**
 * Small helper that seeds the SparMapContext with the given BEC zone codes
 * via `useEffect` (avoiding setState-during-render), then renders the panel
 * beside it. Keeps each test self-contained.
 */
const SeedAndRender = ({
  codes,
  notSuit,
  zoomFn,
}: {
  codes: string[];
  notSuit: string[];
  zoomFn?: (code: string) => Promise<void>;
}) => {
  const { setBecZones, _setMapControls } = useSparMap();
  useEffect(() => {
    setBecZones(codes, notSuit);
    if (zoomFn) {
      _setMapControls({ zoomToBecZone: zoomFn });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <BecZonePanel />;
};

const wrap = (children: ReactNode, url = '/seedlots/map/12345?theme=AOUCBST') => (
  <MemoryRouter initialEntries={[url]}>
    <Routes>
      <Route path="/seedlots/map/:seedlotNumber" element={
        <SparMapProvider>{children}</SparMapProvider>
      } />
    </Routes>
  </MemoryRouter>
);

describe('BecZonePanel', () => {
  it('renders the header text matching the legacy aoucbst_panel (CBST Area of Use Tool + subtitle)', () => {
    render(wrap(<BecZonePanel />));
    expect(screen.queryByTestId('bec-zone-panel')).toBeTruthy();
    expect(screen.queryByText('CBST Area of Use Tool')).toBeTruthy();
    expect(
      screen.queryByText(/List of Biogeoclimatic Zone\/Subzone\/Variants/i)
    ).toBeTruthy();
    expect(screen.queryByText('BEC Zone')).toBeTruthy();
  });

  it('renders each BEC zone code from context with a `*` marker for not-suitable codes', () => {
    render(
      wrap(<SeedAndRender codes={['IDF', 'MH', 'SBS']} notSuit={['MH']} />)
    );
    expect(screen.queryByTestId('bec-zone-panel')).toBeTruthy();
    expect(screen.queryByText('IDF')).toBeTruthy();
    expect(screen.queryByText('MH*')).toBeTruthy();
    expect(screen.queryByText('SBS')).toBeTruthy();
    expect(screen.queryByText(/^MH$/)).toBeNull();
  });

  it('shows the "(*) Species may not be suitable" legend hint when becNotSuit has entries', () => {
    render(
      wrap(<SeedAndRender codes={['IDF', 'MH']} notSuit={['MH']} />)
    );
    expect(screen.queryByTestId('bec-zone-panel-hint')).toBeTruthy();
  });

  it('hides the not-suitable hint when becNotSuit is empty', () => {
    render(
      wrap(<SeedAndRender codes={['IDF', 'SBS']} notSuit={[]} />)
    );
    expect(screen.queryByTestId('bec-zone-panel-hint')).toBeNull();
  });

  it('shows the Seedlot Number from the path param', () => {
    render(wrap(<SeedAndRender codes={['IDF']} notSuit={[]} />));
    const lotDisplay = screen.getByTestId('bec-zone-panel-lot');
    expect(lotDisplay.textContent).toMatch(/Seedlot Number:\s*12345/);
  });

  it('prefers the URL seedlot= param over the path param for display (legacy parity)', () => {
    render(
      wrap(<SeedAndRender codes={['IDF']} notSuit={[]} />, '/seedlots/map/12345?theme=AOUCBST&seedlot=99999')
    );
    const lotDisplay = screen.getByTestId('bec-zone-panel-lot');
    expect(lotDisplay.textContent).toMatch(/Seedlot Number:\s*99999/);
  });

  it('shows the Veglot Number from the URL veglot= param (and hides the Seedlot label)', () => {
    render(
      wrap(<SeedAndRender codes={['IDF']} notSuit={[]} />, '/seedlots/map/12345?theme=AOUCBST&veglot=67890')
    );
    const lotDisplay = screen.getByTestId('bec-zone-panel-lot');
    expect(lotDisplay.textContent).toMatch(/Veglot Number:\s*67890/);
    expect(lotDisplay.textContent).not.toMatch(/Seedlot Number/);
  });

  it('clicking a BEC zone row invokes zoomToBecZone with the row code (no trailing *)', () => {
    const zoomFn = vi.fn(async () => {});
    render(
      wrap(<SeedAndRender codes={['IDF', 'MH']} notSuit={['MH']} zoomFn={zoomFn} />)
    );
    fireEvent.click(screen.getByTestId('bec-zone-row-MH'));
    expect(zoomFn).toHaveBeenCalledWith('MH');
  });

  it('clicked row gets the bec-zone-panel__row--selected modifier', () => {
    render(
      wrap(<SeedAndRender codes={['IDF', 'MH']} notSuit={[]} />)
    );
    fireEvent.click(screen.getByTestId('bec-zone-row-IDF'));
    expect(screen.getByTestId('bec-zone-row-IDF').className)
      .toMatch(/bec-zone-panel__row--selected/);
    expect(screen.getByTestId('bec-zone-row-MH').className)
      .not.toMatch(/bec-zone-panel__row--selected/);
  });

  it('Enter key on a focused row also triggers zoomToBecZone (keyboard accessibility)', () => {
    const zoomFn = vi.fn(async () => {});
    render(
      wrap(<SeedAndRender codes={['IDF']} notSuit={[]} zoomFn={zoomFn} />)
    );
    fireEvent.keyDown(screen.getByTestId('bec-zone-row-IDF'), { key: 'Enter' });
    expect(zoomFn).toHaveBeenCalledWith('IDF');
  });
});
