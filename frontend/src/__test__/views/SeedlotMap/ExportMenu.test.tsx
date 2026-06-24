import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Feature, Polygon } from 'geojson';

import ExportMenu from '../../../views/Seedlot/SeedlotMap/AoiToolbar/ExportMenu';
import {
  SparMapProvider,
  useSparMap,
} from '../../../contexts/SparMapContext';
import type { AoiPolygon } from '../../../types/SparMapTypes';

/**
 * Mock the exportAois utility so we can assert on its invocation
 * without serializing real KML/Shapefile payloads. The real
 * serialization paths have their own dedicated unit suite
 * (`exportShape.test.ts`) — this suite focuses on the Carbon Modal
 * wiring and context integration.
 */
const exportAoisMock = vi.fn(async () => ({
  blob: new Blob(['mock'], { type: 'application/geo+json' }),
  filename: 'spar-aoi-12345-mock.geojson',
  mimeType: 'application/geo+json',
}));

vi.mock('../../../views/Seedlot/SeedlotMap/AoiToolbar/exportShape', () => ({
  exportAois: (...args: unknown[]) => exportAoisMock(...(args as Parameters<typeof exportAoisMock>)),
}));

const buildPolygon = (): AoiPolygon => {
  const feature: Feature<Polygon> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-123.5, 48.5],
        [-123.4, 48.5],
        [-123.4, 48.6],
        [-123.5, 48.6],
        [-123.5, 48.5],
      ]],
    },
  };
  return feature;
};

/**
 * Seeds the SparMapContext with the given polygons via useEffect so we
 * can mount the modal with a populated AOI list. Mirrors the pattern
 * used in GeomCalcPanel.test.tsx.
 */
const SeedAndRender = ({
  aois,
  children,
}: {
  aois: AoiPolygon[];
  children: ReactNode;
}) => {
  const { setAois } = useSparMap();
  useEffect(() => {
    setAois(aois);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
};

const wrap = (children: ReactNode) => (
  <SparMapProvider>{children}</SparMapProvider>
);

describe('ExportMenu', () => {
  beforeEach(() => {
    exportAoisMock.mockClear();
  });

  it('renders the Carbon Modal when open=true', () => {
    render(
      wrap(
        <SeedAndRender aois={[buildPolygon()]}>
          <ExportMenu open onClose={() => {}} seedlotNumber="12345" />
        </SeedAndRender>,
      ),
    );
    expect(screen.queryByTestId('aoi-export-modal')).toBeTruthy();
    expect(screen.queryByText(/Export AOI polygons/)).toBeTruthy();
    // All three radio options should be in the DOM
    expect(screen.queryByLabelText(/GeoJSON/)).toBeTruthy();
    expect(screen.queryByLabelText(/KML/)).toBeTruthy();
    expect(screen.queryByLabelText(/Shapefile/)).toBeTruthy();
  });

  it('disables the Download button when the AOI list is empty', () => {
    render(
      wrap(
        <ExportMenu open onClose={() => {}} seedlotNumber="12345" />,
      ),
    );
    // Carbon Modal renders the primary button with text "Download" —
    // look it up by accessible name and assert disabled.
    const button = screen.getByRole('button', { name: /Download/ }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('enables the Download button when at least one polygon exists', async () => {
    render(
      wrap(
        <SeedAndRender aois={[buildPolygon()]}>
          <ExportMenu open onClose={() => {}} seedlotNumber="12345" />
        </SeedAndRender>,
      ),
    );
    const button = await waitFor(() => {
      const btn = screen.getByRole('button', { name: /Download/ }) as HTMLButtonElement;
      expect(btn.disabled).toBe(false);
      return btn;
    });
    expect(button.disabled).toBe(false);
  });

  it('calls exportAois with the selected format on Download click', async () => {
    // Mock URL.createObjectURL since jsdom doesn't ship it. We assert
    // it gets called with the mocked Blob returned by exportAois.
    const createSpy = vi.fn(() => 'blob:mock-url');
    const revokeSpy = vi.fn();
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = createSpy as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL = revokeSpy as unknown as typeof URL.revokeObjectURL;

    const onClose = vi.fn();
    render(
      wrap(
        <SeedAndRender aois={[buildPolygon()]}>
          <ExportMenu open onClose={onClose} seedlotNumber="12345" />
        </SeedAndRender>,
      ),
    );

    // Wait for the AOI to land in context, then click Download.
    const button = await waitFor(() => {
      const btn = screen.getByRole('button', { name: /Download/ }) as HTMLButtonElement;
      expect(btn.disabled).toBe(false);
      return btn;
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(exportAoisMock).toHaveBeenCalledTimes(1);
    });
    const call = exportAoisMock.mock.calls[0];
    expect(call[1]).toBe('12345');
    // Default format is geojson
    expect(call[2]).toBe('geojson');
    // URL.createObjectURL should have been invoked with the mocked Blob
    expect(createSpy).toHaveBeenCalledTimes(1);
    // Modal should have requested close after a successful export
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });

    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });
});
