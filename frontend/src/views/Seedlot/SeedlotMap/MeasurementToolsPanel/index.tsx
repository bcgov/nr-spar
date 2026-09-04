import React from 'react';
import { useSparMap } from '../../../../contexts/SparMapContext';

/**
 * Measurement Tools panel — mirrors the legacy CWM
 * `Measurement` module (`cwmc-lib/v1.7.2/CWM.js:9514`):
 *
 *   title: "Measurement Tools"
 *   buttons: Measure Distance | Measure Area | Clear Measurement
 *   labels:  Distance: km   Area: ha   Perimeter: km
 *   modes:   linestring | polygon | point
 *
 * The panel writes `measurementMode` into `SparMapContext`;
 * `<MeasureControl>` (inside `<MapContainer>`) watches that and runs
 * the matching click flow, writing numeric results back into
 * `measurementResult` so this panel can display them live.
 */
const formatKm = (km: number): string => {
  if (!Number.isFinite(km) || km <= 0) return '0 m';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(2)} km`;
};

const formatHa = (sqm: number): string => {
  if (!Number.isFinite(sqm) || sqm <= 0) return '0 m²';
  if (sqm < 10_000) return `${Math.round(sqm)} m²`;
  return `${(sqm / 10_000).toFixed(2)} ha`;
};

const formatLatLng = (lat: number, lng: number): string => `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

const MeasurementToolsPanel = () => {
  const { measurementMode, setMeasurementMode, measurementResult } = useSparMap();

  const buttonClass = (mode: 'distance' | 'area' | 'point') => `measurement-tools__btn${
    measurementMode === mode ? ' measurement-tools__btn--active' : ''}`;

  return (
    <div className="measurement-tools" data-testid="measurement-tools-panel">
      <p className="measurement-tools__instructions">
        {measurementMode === null && 'Pick a mode below to start measuring.'}
        {measurementMode === 'distance'
          && 'Click to add vertices. Double-click to finish.'}
        {measurementMode === 'area'
          && 'Click to add vertices. Double-click to close the polygon.'}
        {measurementMode === 'point' && 'Click on the map to drop a point.'}
      </p>

      <div className="measurement-tools__buttons">
        <button
          type="button"
          className={buttonClass('distance')}
          aria-pressed={measurementMode === 'distance'}
          onClick={() => setMeasurementMode('distance')}
          data-testid="measure-distance-btn"
        >
          Measure Distance
        </button>
        <button
          type="button"
          className={buttonClass('area')}
          aria-pressed={measurementMode === 'area'}
          onClick={() => setMeasurementMode('area')}
          data-testid="measure-area-btn"
        >
          Measure Area
        </button>
        <button
          type="button"
          className={buttonClass('point')}
          aria-pressed={measurementMode === 'point'}
          onClick={() => setMeasurementMode('point')}
          data-testid="measure-point-btn"
        >
          Measure Point
        </button>
        <button
          type="button"
          className="measurement-tools__btn measurement-tools__btn--clear"
          onClick={() => setMeasurementMode(null)}
          data-testid="measure-clear-btn"
        >
          Clear Measurement
        </button>
      </div>

      <dl className="measurement-tools__readouts">
        <dt>Distance:</dt>
        <dd data-testid="measure-distance-value">
          {measurementResult?.distanceKm !== undefined
            ? formatKm(measurementResult.distanceKm)
            : '—'}
        </dd>
        <dt>Perimeter:</dt>
        <dd data-testid="measure-perimeter-value">
          {measurementResult?.perimeterKm !== undefined
            ? formatKm(measurementResult.perimeterKm)
            : '—'}
        </dd>
        <dt>Area:</dt>
        <dd data-testid="measure-area-value">
          {measurementResult?.areaSqm !== undefined
            ? formatHa(measurementResult.areaSqm)
            : '—'}
        </dd>
        <dt>Point:</dt>
        <dd data-testid="measure-point-value">
          {measurementResult?.pointLat !== undefined
            && measurementResult?.pointLng !== undefined
            ? formatLatLng(measurementResult.pointLat, measurementResult.pointLng)
            : '—'}
        </dd>
      </dl>
    </div>
  );
};

export default MeasurementToolsPanel;
