import React, { useState } from 'react';
import { IconButton, InlineNotification } from '@carbon/react';
import {
  Help, Printer, Maximize, List, Layers
} from '@carbon/icons-react';

import type { SparMapTheme } from '../../../../types/SparMapTypes';
import { useSparMap } from '../../../../contexts/SparMapContext';
import { printMap } from '../printMap';
import HelpModal from '../HelpModal';

interface MapTopBarProps {
  seedlotNumber: string;
  /** Active theme — `printMap` uses it to pick the legend graphics. */
  theme: SparMapTheme;
  legendOpen: boolean;
  onToggleLegend: () => void;
  layersOpen: boolean;
  onToggleLayers: () => void;
}

/**
 * Toggle fullscreen on the map workspace (not the bare Leaflet container)
 * so the toolbars, search box and side panels stay visible in fullscreen.
 */
const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => undefined);
    return;
  }
  const target = (document.querySelector('.seedlot-map-workspace')
    ?? document.querySelector('.leaflet-container')) as HTMLElement | null;
  target?.requestFullscreen?.().catch(() => undefined);
};

/**
 * Top-right map bar: Help, Print, Fullscreen and Legend icons plus a
 * labelled "Layers" button that opens the Layers panel. Map-level actions
 * live here so the left toolbar holds only navigation and editing tools.
 * Tooltips open below the bar so they stay inside the map.
 */
const MapTopBar = ({
  seedlotNumber, theme, legendOpen, onToggleLegend, layersOpen, onToggleLayers
}: MapTopBarProps) => {
  const { legendData } = useSparMap();
  const [helpOpen, setHelpOpen] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  const onPrint = async () => {
    setPrintError(null);
    try {
      await printMap({ seedlotNumber, theme, legendData });
    } catch (err) {
      setPrintError(err instanceof Error ? err.message : 'Map print capture failed.');
    }
  };

  return (
    <div className="map-topbar" data-testid="map-topbar">
      <div className="map-topbar__row">
        <div className="map-topbar__icons" role="toolbar" aria-label="Map options">
          <IconButton
            label="Help"
            align="bottom"
            kind="ghost"
            onClick={() => setHelpOpen(true)}
            data-testid="map-help"
          >
            <Help />
          </IconButton>
          <IconButton
            label="Print map"
            align="bottom"
            kind="ghost"
            onClick={() => { onPrint().catch(() => undefined); }}
            data-testid="map-print"
          >
            <Printer />
          </IconButton>
          <IconButton
            label="Fullscreen"
            align="bottom"
            kind="ghost"
            onClick={toggleFullscreen}
            data-testid="map-fullscreen"
          >
            <Maximize />
          </IconButton>
          <IconButton
            label="Map legend"
            align="bottom-end"
            kind="ghost"
            onClick={onToggleLegend}
            aria-pressed={legendOpen}
            className={legendOpen ? 'map-topbar__btn--active' : ''}
            data-testid="map-legend"
          >
            <List />
          </IconButton>
        </div>
        <button
          type="button"
          className={`map-topbar__layers${layersOpen ? ' map-topbar__layers--active' : ''}`}
          aria-pressed={layersOpen}
          onClick={onToggleLayers}
          data-testid="map-layers"
        >
          <Layers size={16} aria-hidden="true" />
          Layers
        </button>
      </div>
      {printError && (
        <InlineNotification
          kind="error"
          title="Could not print the map"
          subtitle={printError}
          lowContrast
          onCloseButtonClick={() => setPrintError(null)}
          data-testid="map-print-error"
        />
      )}
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
};

export default MapTopBar;
