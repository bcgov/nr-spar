import React, { useState } from 'react';
import {
  Modal,
  RadioButtonGroup,
  RadioButton,
  InlineNotification
} from '@carbon/react';

import { useSparMap } from '../../../../contexts/SparMapContext';
import { exportAois, type ExportFormat } from './exportShape';

interface ExportMenuProps {
  open: boolean;
  onClose: () => void;
  seedlotNumber: string;
}

/**
 * Carbon Modal wrapper around the multi-format AOI export flow. The
 * user picks GeoJSON, KML, or Shapefile via a RadioButtonGroup and
 * clicks Download — `exportAois` generates the Blob, we synthesize a
 * hidden `<a>` pointing at a `blob:` URL, click it, and revoke the
 * object URL.
 *
 * Lives in the AoiToolbar folder because it's tightly coupled to the
 * Export button that opens it — the parent owns `open`/`onClose` state
 * so the toolbar can disable the button while `busy`.
 *
 * Errors from `exportAois` (notably the empty-AOI guard) surface inside
 * the modal via a Carbon InlineNotification so the user can fix the
 * condition without losing their format selection.
 */
const ExportMenu = ({ open, onClose, seedlotNumber }: ExportMenuProps) => {
  const { aois } = useSparMap();
  const [format, setFormat] = useState<ExportFormat>('geojson');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestClose = () => {
    if (busy) return;
    setError(null);
    onClose();
  };

  const handleExport = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await exportAois(aois, seedlotNumber, format);
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const polygonCount = aois.length;
  const polygonLabel = `${polygonCount} polygon${polygonCount === 1 ? '' : 's'}`;

  return (
    <Modal
      open={open}
      modalHeading="Export AOI polygons"
      primaryButtonText={busy ? 'Downloading…' : 'Download'}
      secondaryButtonText="Cancel"
      primaryButtonDisabled={busy || polygonCount === 0}
      onRequestSubmit={handleExport}
      onRequestClose={handleRequestClose}
      data-testid="aoi-export-modal"
    >
      <p>
        {`Choose an export format. ${polygonLabel} will be included in the download.`}
      </p>
      <RadioButtonGroup
        name="export-format"
        legendText="Format"
        valueSelected={format}
        onChange={(value: string | number) => setFormat(String(value) as ExportFormat)}
        orientation="vertical"
      >
        <RadioButton
          id="export-format-geojson"
          value="geojson"
          labelText="GeoJSON (.geojson) — modern, human-readable"
        />
        <RadioButton
          id="export-format-kml"
          value="kml"
          labelText="KML (.kml) — Google Earth, legacy SPAR"
        />
        <RadioButton
          id="export-format-shapefile"
          value="shapefile"
          labelText="Shapefile (.zip) — ESRI ArcGIS / QGIS"
        />
      </RadioButtonGroup>
      {error && (
        <InlineNotification
          kind="error"
          title="Export failed"
          subtitle={error}
          lowContrast
          hideCloseButton
          data-testid="aoi-export-error"
        />
      )}
    </Modal>
  );
};

export default ExportMenu;
