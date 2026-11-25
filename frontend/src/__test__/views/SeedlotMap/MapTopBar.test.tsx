import React from 'react';
import {
  render, screen, fireEvent, waitFor
} from '@testing-library/react';
import {
  describe, it, expect, vi, beforeEach
} from 'vitest';

import MapTopBar from '../../../views/Seedlot/SeedlotMap/MapTopBar';
import { printMap } from '../../../views/Seedlot/SeedlotMap/printMap';

vi.mock('../../../contexts/SparMapContext', () => ({ useSparMap: () => ({ legendData: [] }) }));
vi.mock('../../../views/Seedlot/SeedlotMap/printMap', () => ({ printMap: vi.fn() }));
vi.mock('../../../views/Seedlot/SeedlotMap/HelpModal', () => ({
  default: ({ open }: { open: boolean }) => (open ? <div data-testid="help-modal" /> : null)
}));

const props = {
  seedlotNumber: '60001',
  theme: 'aoua' as const,
  legendOpen: false,
  onToggleLegend: vi.fn(),
  layersOpen: false,
  onToggleLayers: vi.fn()
};

beforeEach(() => vi.clearAllMocks());

describe('MapTopBar', () => {
  it('toggles the legend and layers panels', () => {
    render(<MapTopBar {...props} layersOpen />);
    fireEvent.click(screen.getByTestId('map-legend'));
    expect(props.onToggleLegend).toHaveBeenCalled();
    expect(screen.getByTestId('map-layers')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByTestId('map-layers'));
    expect(props.onToggleLayers).toHaveBeenCalled();
  });

  it('opens help', () => {
    render(<MapTopBar {...props} />);
    fireEvent.click(screen.getByTestId('map-help'));
    expect(screen.getByTestId('help-modal')).toBeInTheDocument();
  });

  it('prints, and reports a failed print', async () => {
    vi.mocked(printMap).mockRejectedValueOnce(new Error('canvas tainted'));
    render(<MapTopBar {...props} />);
    fireEvent.click(screen.getByTestId('map-print'));
    await waitFor(() => expect(screen.getByTestId('map-print-error')).toHaveTextContent('canvas tainted'));
    expect(printMap).toHaveBeenCalledWith(expect.objectContaining({ seedlotNumber: '60001', theme: 'aoua' }));
  });

  it('enters fullscreen on the workspace, and leaves it when already fullscreen', () => {
    const workspace = document.createElement('div');
    workspace.className = 'seedlot-map-workspace';
    workspace.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    document.body.appendChild(workspace);
    render(<MapTopBar {...props} />);
    fireEvent.click(screen.getByTestId('map-fullscreen'));
    expect(workspace.requestFullscreen).toHaveBeenCalled();

    const exitFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document, 'fullscreenElement', { value: workspace, configurable: true });
    document.exitFullscreen = exitFullscreen;
    fireEvent.click(screen.getByTestId('map-fullscreen'));
    expect(exitFullscreen).toHaveBeenCalled();
    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });
    workspace.remove();
  });
});
