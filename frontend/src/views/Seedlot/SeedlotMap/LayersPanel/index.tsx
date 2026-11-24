import React, { useMemo, useState } from 'react';
import {
  Checkbox, Search, Select, SelectItem
} from '@carbon/react';
import {
  Add, ChevronDown, ChevronRight, Close, CollapseAll, ExpandAll
} from '@carbon/icons-react';

import type { SparMapTheme } from '../../../../types/SparMapTypes';
import { getThemeProfile } from '../../../../config/leaflet-themes';
import { BCGW_CATALOG } from '../../../../config/bcgw-catalog';
import { useSparMap } from '../../../../contexts/SparMapContext';
import { useMapLayers } from '../MapLayers/MapLayersContext';
import {
  BASE_LAYERS,
  buildLayerGroups,
  catalogLayerKey,
  groupLayerIds,
  type LayerGroup,
  type LayerRow
} from '../MapLayers/layerDefs';
import LayerCatalogModal from '../LayerCatalogModal';

/** Second argument of Carbon `Checkbox` `onChange`. */
interface CheckboxChange { checked: boolean }

interface OpacitySliderProps {
  label: string;
  value: number;
  onChange: (opacity: number) => void;
}

/** Compact 0–100 % range input used on every layer row. */
const OpacitySlider = ({ label, value, onChange }: OpacitySliderProps) => {
  const percent = Math.round(value * 100);
  return (
    <input
      type="range"
      min={0}
      max={100}
      step={5}
      value={percent}
      className="layers-panel__opacity"
      aria-label={`${label} opacity`}
      title={`Opacity: ${percent}%`}
      onChange={(event) => onChange(Number(event.target.value) / 100)}
    />
  );
};

const matches = (label: string, query: string) => label.toLowerCase().includes(query);

/**
 * Narrow a group to the rows matching the search, or null to hide it.
 * When only some children match, the group's own layer (e.g. the "all
 * species" seedlot layer) is dropped too, so the group and All
 * checkboxes switch only the matching layers.
 */
const filterGroup = (group: LayerGroup, query: string): LayerGroup | null => {
  if (!query || matches(group.label, query)) return group;
  const children = group.children?.filter((c) => matches(c.label, query)) ?? [];
  if (children.length === 0) return null;
  return { ...group, layer: undefined, children };
};

interface LayersPanelProps {
  theme: SparMapTheme;
  onClose: () => void;
}

/**
 * Layers side panel (top-right, opened from the "Layers" button): base map
 * picker, layer search, an "All" checkbox, collapsible legacy SPAR layer
 * groups with per-layer opacity sliders, and a "User Layers" section for
 * DataBC catalog layers. Reads and writes `MapLayersContext`;
 * `<MapLayersSync>` applies the changes to the map.
 */
const LayersPanel = ({ theme, onClose }: LayersPanelProps) => {
  const {
    baseLayerId, visible, opacity, setBaseLayer, setLayersVisible, setLayerOpacity
  } = useMapLayers();
  const { activeCatalogLayers, toggleCatalogLayer } = useSparMap();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [catalogOpen, setCatalogOpen] = useState(false);

  const groups = useMemo(
    () => buildLayerGroups(getThemeProfile(theme).overlays),
    [theme]
  );
  const normalizedQuery = query.trim().toLowerCase();
  const shownGroups = groups
    .map((g) => filterGroup(g, normalizedQuery))
    .filter((g): g is LayerGroup => g !== null);

  const isOn = (id: string) => visible[id] === true;
  const opacityOf = (id: string) => opacity[id] ?? 1;

  // "All" turns every listed layer on or off, children included.
  const allIds = shownGroups.flatMap(groupLayerIds);
  const allOn = allIds.length > 0 && allIds.every(isOn);
  const someOn = allIds.some(isOn);

  const toggleExpanded = (label: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  };
  const expandableLabels = groups.filter((g) => g.children).map((g) => g.label);

  const renderLayerRow = (row: LayerRow, label = row.label) => (
    <div className="layers-panel__row" key={row.id}>
      <Checkbox
        id={`layer-${row.id}`}
        labelText={label}
        checked={isOn(row.id)}
        onChange={(_event: unknown, { checked }: CheckboxChange) => setLayersVisible([row.id], checked)}
      />
      {isOn(row.id) && (
        <OpacitySlider
          label={label}
          value={opacityOf(row.id)}
          onChange={(value) => setLayerOpacity(row.id, value)}
        />
      )}
    </div>
  );

  const renderGroup = (group: LayerGroup) => {
    if (!group.children) return group.layer ? renderLayerRow(group.layer, group.label) : null;

    // While searching, show the matching children without extra clicks.
    const open = expanded.has(group.label) || normalizedQuery !== '';
    // The group checkbox turns every layer in the group on or off.
    const ids = groupLayerIds(group);
    const checked = ids.every(isOn);
    const indeterminate = !checked && ids.some(isOn);
    const ownLayer = group.layer;
    return (
      <div className="layers-panel__group" key={group.label}>
        <div className="layers-panel__row">
          <Checkbox
            id={`layer-group-${group.label}`}
            labelText={group.label}
            checked={checked}
            indeterminate={indeterminate}
            onChange={(_event: unknown, { checked: next }: CheckboxChange) => setLayersVisible(ids, next)}
          />
          {ownLayer && isOn(ownLayer.id) && (
            <OpacitySlider
              label={group.label}
              value={opacityOf(ownLayer.id)}
              onChange={(value) => setLayerOpacity(ownLayer.id, value)}
            />
          )}
          <button
            type="button"
            className="layers-panel__chevron"
            aria-expanded={open}
            aria-label={`${open ? 'Collapse' : 'Expand'} ${group.label}`}
            onClick={() => toggleExpanded(group.label)}
          >
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
        {open && (
          <div className="layers-panel__children">
            {group.children.map((child) => renderLayerRow(child))}
          </div>
        )}
      </div>
    );
  };

  const userLayers = activeCatalogLayers
    .map((id) => BCGW_CATALOG.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => l !== undefined);

  return (
    <section
      className="map-overlay map-overlay--side-panel-right layers-panel"
      aria-label="Layers"
      data-testid="layers-panel"
    >
      <div className="map-overlay__header">
        <span>Layers</span>
        <button
          type="button"
          className="map-overlay__close"
          aria-label="Close layers"
          onClick={onClose}
        >
          <Close size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="layers-panel__controls">
        <div className="layers-panel__base">
          <Select
            id="layers-panel-base-map"
            labelText="Base map"
            inline
            size="sm"
            value={baseLayerId}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setBaseLayer(event.target.value)}
          >
            {BASE_LAYERS.map((b) => <SelectItem key={b.id} value={b.id} text={b.label} />)}
          </Select>
          {/* No opacity slider: the base map always shows at full opacity. */}
        </div>
        <div className="layers-panel__filter">
          <Search
            size="sm"
            labelText="Search layers"
            placeholder="Search layers…"
            value={query}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
          />
          <Checkbox
            id="layers-panel-all"
            labelText="All"
            checked={allOn}
            indeterminate={!allOn && someOn}
            disabled={allIds.length === 0}
            onChange={(_event: unknown, { checked }: CheckboxChange) => setLayersVisible(allIds, checked)}
          />
          <button
            type="button"
            className="layers-panel__chevron"
            aria-label="Expand all groups"
            title="Expand all groups"
            onClick={() => setExpanded(new Set(expandableLabels))}
          >
            <ExpandAll size={16} />
          </button>
          <button
            type="button"
            className="layers-panel__chevron"
            aria-label="Collapse all groups"
            title="Collapse all groups"
            onClick={() => setExpanded(new Set())}
          >
            <CollapseAll size={16} />
          </button>
        </div>
      </div>

      <div className="map-overlay__body layers-panel__list">
        {shownGroups.length === 0
          ? (
            <p className="layers-panel__empty">
              No layers match “
              {query.trim()}
              ”.
            </p>
)
          : shownGroups.map(renderGroup)}
      </div>

      <div className="layers-panel__user">
        <div className="layers-panel__user-header">
          <span>User Layers</span>
          <button
            type="button"
            className="layers-panel__add"
            onClick={() => setCatalogOpen(true)}
          >
            <Add size={16} aria-hidden="true" />
            Add DataBC layers
          </button>
        </div>
        {userLayers.map((entry) => {
          const key = catalogLayerKey(entry.id);
          const on = visible[key] ?? true;
          return (
            <div className="layers-panel__row" key={entry.id}>
              <Checkbox
                id={`layer-${key}`}
                labelText={entry.displayName}
                checked={on}
                onChange={(_event: unknown, { checked }: CheckboxChange) => setLayersVisible([key], checked)}
              />
              {on && (
                <OpacitySlider
                  label={entry.displayName}
                  value={opacityOf(key)}
                  onChange={(value) => setLayerOpacity(key, value)}
                />
              )}
              <button
                type="button"
                className="layers-panel__chevron"
                aria-label={`Remove ${entry.displayName}`}
                title="Remove layer"
                onClick={() => toggleCatalogLayer(entry.id)}
              >
                <Close size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <LayerCatalogModal open={catalogOpen} onClose={() => setCatalogOpen(false)} />
    </section>
  );
};

export default LayersPanel;
