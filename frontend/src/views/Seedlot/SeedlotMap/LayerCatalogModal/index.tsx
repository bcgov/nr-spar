import React from 'react';
import {
  Checkbox, ComposedModal, ModalHeader, ModalBody
} from '@carbon/react';

import { BCGW_CATALOG } from '../../../../config/bcgw-catalog';
import { useSparMap } from '../../../../contexts/SparMapContext';

interface LayerCatalogModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Carbon modal presenting a checklist of curated DataBC WMS layers.
 * Toggling a checkbox adds or removes the layer as a `WMSTileLayer`
 * overlay in the Leaflet map for the current session. State lives in
 * `SparMapContext.activeCatalogLayers` so LeafletMap can read it
 * directly without prop-drilling.
 *
 * Adding new layers: edit `config/bcgw-catalog.ts` — no changes needed
 * here. The modal iterates the catalog array dynamically.
 */
const LayerCatalogModal = ({ open, onClose }: LayerCatalogModalProps) => {
  const { activeCatalogLayers, toggleCatalogLayer } = useSparMap();

  return (
    <ComposedModal
      open={open}
      onClose={onClose}
      size="sm"
      data-testid="layer-catalog-modal"
    >
      <ModalHeader title="Add DataBC Layers" />
      <ModalBody>
        <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#525252' }}>
          Toggle layers for this session. Changes are not saved.
        </p>
        {BCGW_CATALOG.map((layer) => (
          <Checkbox
            key={layer.id}
            id={`catalog-layer-${layer.id}`}
            labelText={`${layer.displayName} — ${layer.description}`}
            checked={activeCatalogLayers.includes(layer.id)}
            onChange={() => toggleCatalogLayer(layer.id)}
            data-testid={`catalog-layer-${layer.id}`}
          />
        ))}
      </ModalBody>
    </ComposedModal>
  );
};

export default LayerCatalogModal;
