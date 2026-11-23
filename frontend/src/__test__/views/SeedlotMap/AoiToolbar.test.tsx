import React from 'react';
import {
  render, screen, fireEvent, waitFor, act
} from '@testing-library/react';
import {
  MemoryRouter, Routes, Route, useLocation
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  describe, it, expect, vi, beforeEach
} from 'vitest';

import AoiToolbar from '../../../views/Seedlot/SeedlotMap/AoiToolbar';
import { validateAoiPolygons, validatePolygons, buildMultiPolygonFeature } from '../../../views/Seedlot/SeedlotMap/AoiToolbar/aoiValidation';
import { importShapeFile } from '../../../views/Seedlot/SeedlotMap/AoiToolbar/importShape';
import { exportAois } from '../../../views/Seedlot/SeedlotMap/AoiToolbar/exportShape';
import { deriveCollectionAreaResult } from '../../../views/Seedlot/SeedlotMap/collectionAreaResult';
import { getSeedlotById } from '../../../api-service/seedlotAPI';

// Every render mounts the full toolbar plus two Carbon modals; under the
// full parallel suite single tests have taken ~5s, so allow headroom.
vi.setConfig({ testTimeout: 20_000 });

const sparMap: Record<string, unknown> = {};

vi.mock('../../../contexts/SparMapContext', () => ({
  useSparMap: () => sparMap
}));
vi.mock('../../../api-service/seedlotAPI', () => ({
  getSeedlotById: vi.fn()
}));
vi.mock('../../../views/Seedlot/SeedlotMap/AoiToolbar/aoiValidation', () => ({
  validateAoiPolygons: vi.fn(),
  validatePolygons: vi.fn(),
  buildMultiPolygonFeature: vi.fn()
}));
vi.mock('../../../views/Seedlot/SeedlotMap/AoiToolbar/importShape', () => ({
  importShapeFile: vi.fn(),
  ACCEPTED_IMPORT_FILE_EXTENSIONS: ['.kml', '.kmz', '.zip']
}));
vi.mock('../../../views/Seedlot/SeedlotMap/AoiToolbar/exportShape', () => ({
  exportAois: vi.fn()
}));
vi.mock('../../../views/Seedlot/SeedlotMap/collectionAreaResult', () => ({
  deriveCollectionAreaResult: vi.fn()
}));

const AOI = { id: 'a1' };

const resetSparMap = (overrides: Record<string, unknown> = {}) => {
  Object.keys(sparMap).forEach((k) => delete sparMap[k]);
  Object.assign(sparMap, {
    aois: [],
    startDraw: vi.fn(),
    startEdit: vi.fn(),
    startRemovalMode: vi.fn(),
    cancelAoiMode: vi.fn(),
    addImportedLayersToMap: vi.fn(),
    identifyActive: false,
    setIdentifyActive: vi.fn(),
    setMeasurementMode: vi.fn(),
    graticuleVisible: false,
    setGraticuleVisible: vi.fn(),
    startDrawRectangle: vi.fn(),
    startDrawCircle: vi.fn(),
    startDrawLine: vi.fn(),
    zoomToAois: vi.fn(),
    setBecZones: vi.fn(),
    liveAoiValidation: null,
    ...overrides
  });
};

let landedState: unknown = null;
const RegistrationProbe = () => {
  landedState = useLocation().state;
  return <div data-testid="registration-page" />;
};

const renderToolbar = ({
  url = '/map',
  state,
  props = {}
}: { url?: string; state?: unknown; props?: Record<string, unknown> } = {}) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[{ pathname: url.split('?')[0], search: url.includes('?') ? `?${url.split('?')[1]}` : '', state }]}>
        <Routes>
          <Route
            path="/map"
            element={<AoiToolbar seedlotNumber="60001" {...props} />}
          />
          <Route path="/seedlots/b-class-registration/:seedlotNumber" element={<RegistrationProbe />} />
          <Route path="*" element={<RegistrationProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const notification = () => screen.getByTestId('aoi-validation-notification');

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  landedState = null;
  resetSparMap();
});

describe('AoiToolbar welcome panel', () => {
  it('shows once, then stays dismissed', () => {
    const { unmount } = renderToolbar();
    expect(screen.getByTestId('aoi-welcome-body')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Got it'));
    expect(screen.queryByTestId('aoi-welcome-body')).not.toBeInTheDocument();
    unmount();
    renderToolbar();
    expect(screen.queryByTestId('aoi-welcome-body')).not.toBeInTheDocument();
  });
});

describe('AoiToolbar sections', () => {
  const toolIds = (name: string) => [
    ...screen.getByRole('toolbar', { name }).querySelectorAll('[data-testid^="aoi-"]')
  ].map((el) => el.getAttribute('data-testid'));

  it('splits the tools into a polygon box and a map box', () => {
    renderToolbar();
    expect(toolIds('Polygon tools')).toEqual([
      'aoi-draw', 'aoi-edit-polygon', 'aoi-delete-polygon', 'aoi-zoom-aois', 'aoi-import-shape',
      'aoi-export', 'aoi-start-measure', 'aoi-validate', 'aoi-submit'
    ]);
    expect(toolIds('Map tools')).toEqual(['aoi-identify', 'aoi-cancel']);
    expect(screen.getByTestId('aoi-cancel').closest('.cds--popover-container'))
      .toHaveTextContent('Close the map without saving');
  });

  it('shows only the map box, without Close, on a view-only theme', () => {
    renderToolbar({ props: { drawingEnabled: false } });
    expect(screen.queryByRole('toolbar', { name: 'Polygon tools' })).not.toBeInTheDocument();
    expect(toolIds('Map tools')).toEqual(['aoi-identify', 'aoi-start-measure']);
    expect(screen.queryByTestId('aoi-welcome')).not.toBeInTheDocument();
  });

  it('opens tooltips to the right of the strip so they are not cut off', () => {
    renderToolbar();
    const tooltip = screen.getByTestId('aoi-draw').closest('.cds--popover-container');
    expect(tooltip).toHaveClass('cds--popover--right');
  });

  it('starts each shape from the Draw picker and leaves identify mode', () => {
    renderToolbar();
    const shapes: Array<[string, string]> = [
      ['aoi-add-polygon', 'startDraw'],
      ['aoi-add-rectangle', 'startDrawRectangle'],
      ['aoi-add-circle', 'startDrawCircle'],
      ['aoi-add-line', 'startDrawLine']
    ];
    shapes.forEach(([testId, fn]) => {
      expect(screen.queryByTestId('aoi-shape-picker')).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId('aoi-draw'));
      fireEvent.click(screen.getByTestId(testId));
      expect(sparMap[fn]).toHaveBeenCalled();
    });
    expect(screen.queryByTestId('aoi-shape-picker')).not.toBeInTheDocument();
    expect(sparMap.setIdentifyActive).toHaveBeenCalledWith(false);
    expect(sparMap.setBecZones).toHaveBeenCalledWith([], [], 'zone');
  });

  it('drives the polygon tools', () => {
    resetSparMap({ aois: [AOI] });
    renderToolbar();
    const tools: Array<[string, string]> = [
      ['aoi-edit-polygon', 'startEdit'],
      ['aoi-delete-polygon', 'startRemovalMode'],
      ['aoi-zoom-aois', 'zoomToAois']
    ];
    tools.forEach(([testId, fn]) => {
      fireEvent.click(screen.getByTestId(testId));
      expect(sparMap[fn]).toHaveBeenCalled();
    });
  });

  it('disables AOI-dependent tools when nothing is drawn', () => {
    renderToolbar();
    ['aoi-edit-polygon', 'aoi-delete-polygon', 'aoi-validate', 'aoi-submit', 'aoi-zoom-aois', 'aoi-export']
      .forEach((id) => expect(screen.getByTestId(id)).toBeDisabled());
  });

  it('toggles the measurement tools panel', () => {
    const onToggleMeasure = vi.fn();
    renderToolbar({ props: { onToggleMeasure, measureOpen: true } });
    expect(screen.getByTestId('aoi-start-measure')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByTestId('aoi-start-measure'));
    expect(onToggleMeasure).toHaveBeenCalled();
  });

  it('closes back to the page that opened the map', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/opener', '/map']} initialIndex={1}>
          <Routes>
            <Route path="/map" element={<AoiToolbar seedlotNumber="60001" />} />
            <Route path="/opener" element={<div data-testid="opener-page" />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
    fireEvent.click(screen.getByTestId('aoi-cancel'));
    expect(screen.getByTestId('opener-page')).toBeInTheDocument();
  });
});

describe('AoiToolbar identify', () => {
  it('toggles identify mode and cancels any drawing', () => {
    renderToolbar();
    fireEvent.click(screen.getByTestId('aoi-identify'));
    expect(sparMap.setIdentifyActive).toHaveBeenCalledWith(true);
    expect(sparMap.cancelAoiMode).toHaveBeenCalled();
  });
});

describe('AoiToolbar validation', () => {
  beforeEach(() => resetSparMap({ aois: [AOI] }));

  it('reports a pass and clears BEC highlights', async () => {
    vi.mocked(validateAoiPolygons).mockResolvedValue({ ok: true, message: 'All good', becZones: ['CWH'] } as never);
    renderToolbar();
    fireEvent.click(screen.getByTestId('aoi-validate'));
    await waitFor(() => expect(notification()).toHaveTextContent('Validation passed'));
    expect(sparMap.setBecZones).toHaveBeenLastCalledWith([], [], 'zone');
  });

  it('highlights every zone when the polygon spans more than one', async () => {
    vi.mocked(validateAoiPolygons).mockResolvedValue({ ok: false, message: 'Spans 2 zones', becZones: ['CWH', 'MH'] } as never);
    renderToolbar();
    fireEvent.click(screen.getByTestId('aoi-validate'));
    await waitFor(() => expect(notification()).toHaveTextContent('Spans 2 zones'));
    expect(sparMap.setBecZones).toHaveBeenLastCalledWith(['CWH', 'MH'], ['CWH', 'MH'], 'zone');
  });

  it('reports a validation that throws', async () => {
    vi.mocked(validateAoiPolygons).mockRejectedValue(new Error('WFS down'));
    renderToolbar();
    fireEvent.click(screen.getByTestId('aoi-validate'));
    await waitFor(() => expect(notification()).toHaveTextContent('WFS down'));
  });

  it('shows the live validation warning only while no manual result is shown', () => {
    resetSparMap({ aois: [AOI], liveAoiValidation: { ok: false, message: 'Self-intersecting' } });
    renderToolbar();
    expect(screen.getByTestId('aoi-live-validation-notification')).toHaveTextContent('Self-intersecting');
  });
});

describe('AoiToolbar submit', () => {
  beforeEach(() => {
    resetSparMap({ aois: [AOI] });
    vi.mocked(buildMultiPolygonFeature).mockReturnValue({ type: 'Feature' } as never);
    vi.mocked(validatePolygons).mockReturnValue({ ok: true, message: '' } as never);
    vi.mocked(validateAoiPolygons).mockResolvedValue({ ok: true, message: '', becZones: ['CWH'] } as never);
    vi.mocked(getSeedlotById).mockResolvedValue({ seedlot: { vegetationCode: 'FDC' } } as never);
  });

  it('blocks submit on a topology error', async () => {
    vi.mocked(validatePolygons).mockReturnValue({ ok: false, message: 'Polygons overlap' } as never);
    renderToolbar();
    fireEvent.click(screen.getByTestId('aoi-submit'));
    await waitFor(() => expect(notification()).toHaveTextContent('Polygons overlap'));
    expect(validateAoiPolygons).not.toHaveBeenCalled();
  });

  it('blocks submit when the BEC check fails and highlights the zones', async () => {
    vi.mocked(validateAoiPolygons).mockResolvedValue({ ok: false, message: 'Spans 2 zones', becZones: ['CWH', 'MH'] } as never);
    renderToolbar();
    fireEvent.click(screen.getByTestId('aoi-submit'));
    await waitFor(() => expect(notification()).toHaveTextContent('Cannot submit'));
    expect(sparMap.setBecZones).toHaveBeenLastCalledWith(['CWH', 'MH'], ['CWH', 'MH'], 'zone');
  });

  it('only validates on a standalone map', async () => {
    renderToolbar();
    fireEvent.click(screen.getByTestId('aoi-submit'));
    await waitFor(() => expect(notification()).toHaveTextContent('Polygons validated'));
    expect(deriveCollectionAreaResult).not.toHaveBeenCalled();
  });

  it('returns the derived collection area to the registration form', async () => {
    vi.mocked(deriveCollectionAreaResult).mockResolvedValue({ areaHectares: 12.5 } as never);
    renderToolbar({ url: '/map?returnTo=1' });
    await waitFor(() => expect(screen.getByTestId('aoi-submit')).not.toBeDisabled());
    fireEvent.click(screen.getByTestId('aoi-submit'));
    await waitFor(() => expect(screen.getByTestId('registration-page')).toBeInTheDocument());
    expect(deriveCollectionAreaResult).toHaveBeenCalledWith({ type: 'Feature' }, ['CWH'], 1, 'FDC');
    expect(landedState).toMatchObject({
      collectionAreaResult: { areaHectares: 12.5 },
      collectionAreaSummary: { polygonCount: 1, areaHectares: 12.5, becZones: ['CWH'] }
    });
  });

  it('reports a collection area that cannot be derived', async () => {
    vi.mocked(deriveCollectionAreaResult).mockRejectedValue(new Error('Elevation lookup failed'));
    renderToolbar({ url: '/map?returnTo=1' });
    await waitFor(() => expect(screen.getByTestId('aoi-submit')).not.toBeDisabled());
    fireEvent.click(screen.getByTestId('aoi-submit'));
    await waitFor(() => expect(notification()).toHaveTextContent('Elevation lookup failed'));
  });

  it('offers to remove a saved area when the map reopened with one and nothing is drawn', async () => {
    resetSparMap({ aois: [] });
    renderToolbar({ url: '/map?returnTo=1', state: { initialAoiGeoJson: '{}' } });
    await waitFor(() => expect(screen.getByTestId('aoi-submit')).not.toBeDisabled());
    fireEvent.click(screen.getByTestId('aoi-submit'));
    // Text lookup instead of a role query: role queries are slow on a large
    // Carbon DOM and timed out under full-suite load.
    fireEvent.click(await screen.findByText('Remove collection area', { selector: 'button' }));
    await waitFor(() => expect(landedState).toEqual({ collectionAreaCleared: true }));
  });
});

describe('AoiToolbar import', () => {
  const pickFile = async (name = 'area.kml') => {
    const file = new File(['<kml/>'], name);
    await act(async () => {
      fireEvent.change(screen.getByTestId('aoi-import-shape-input'), { target: { files: [file] } });
    });
  };

  it('opens the file picker from the import button', () => {
    renderToolbar();
    const input = screen.getByTestId('aoi-import-shape-input') as HTMLInputElement;
    const click = vi.spyOn(input, 'click');
    fireEvent.click(screen.getByTestId('aoi-import-shape'));
    expect(click).toHaveBeenCalled();
  });

  it('adds imported polygons to the map', async () => {
    vi.mocked(importShapeFile).mockResolvedValue({ polygons: [{}, {}], warnings: [] } as never);
    renderToolbar();
    await pickFile();
    expect(sparMap.addImportedLayersToMap).toHaveBeenCalledWith([{}, {}]);
    expect(screen.getByTestId('aoi-import-notification')).toHaveTextContent('2 polygons imported from area.kml.');
  });

  it('surfaces import warnings', async () => {
    vi.mocked(importShapeFile).mockResolvedValue({ polygons: [{}], warnings: ['Skipped 1 point'] } as never);
    renderToolbar();
    await pickFile();
    expect(screen.getByTestId('aoi-import-notification')).toHaveTextContent('Imported with warnings');
    expect(screen.getByTestId('aoi-import-notification')).toHaveTextContent('1 polygon imported from area.kml. Skipped 1 point');
  });

  it('reports a file with no polygons', async () => {
    vi.mocked(importShapeFile).mockResolvedValue({ polygons: [], warnings: [] } as never);
    renderToolbar();
    await pickFile();
    expect(screen.getByTestId('aoi-import-notification')).toHaveTextContent('No polygon geometries were found');
    expect(sparMap.addImportedLayersToMap).not.toHaveBeenCalled();
  });

  it('reports a failed import', async () => {
    vi.mocked(importShapeFile).mockRejectedValue(new Error('Corrupt zip'));
    renderToolbar();
    await pickFile('area.zip');
    expect(screen.getByTestId('aoi-import-notification')).toHaveTextContent('Corrupt zip');
  });
});

describe('ExportMenu', () => {
  beforeEach(() => resetSparMap({ aois: [AOI] }));

  it('downloads the chosen format and closes', async () => {
    vi.mocked(exportAois).mockResolvedValue({ blob: new Blob(['x']), filename: 'aoi.kml' } as never);
    URL.createObjectURL = vi.fn(() => 'blob:aoi');
    URL.revokeObjectURL = vi.fn();
    renderToolbar();
    fireEvent.click(screen.getByTestId('aoi-export'));
    expect(screen.getByText(/1 polygon will be included/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/KML \(\.kml\)/));
    fireEvent.click(screen.getByText('Download'));
    await waitFor(() => expect(exportAois).toHaveBeenCalledWith([AOI], '60001', 'kml'));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:aoi');
  });

  it('keeps the modal open and shows the error when export fails', async () => {
    vi.mocked(exportAois).mockRejectedValue(new Error('No polygons to export'));
    renderToolbar();
    fireEvent.click(screen.getByTestId('aoi-export'));
    fireEvent.click(screen.getByText('Download'));
    await waitFor(() => expect(screen.getByTestId('aoi-export-error')).toHaveTextContent('No polygons to export'));
  });
});
