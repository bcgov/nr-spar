import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

import { type MarkupPointCoordinate, useSparMap } from '../../../../contexts/SparMapContext';

const CWM_POINT_SIZE = 25;

const cwmMarkupPointIcon = L.divIcon({
  className: 'cwm-markup-point-icon',
  html: '<span class="cwm-markup-point-icon__star" aria-hidden="true"></span>',
  iconSize: [CWM_POINT_SIZE, CWM_POINT_SIZE],
  iconAnchor: [CWM_POINT_SIZE / 2, CWM_POINT_SIZE / 2]
});

const hemisphereFor = (value: number, axis: 'lat' | 'lng') => {
  if (axis === 'lat') return value < 0 ? 'S' : 'N';
  return value < 0 ? 'W' : 'E';
};

const formatDms = (value: number, axis: 'lat' | 'lng') => {
  const hemisphere = hemisphereFor(value, axis);
  const absolute = Math.abs(value);
  const degrees = Math.floor(absolute);
  const minutesFloat = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  let seconds = Math.round((minutesFloat - minutes) * 60 * 10) / 10;
  let adjustedMinutes = minutes;
  let adjustedDegrees = degrees;

  if (seconds >= 60) {
    seconds -= 60;
    adjustedMinutes += 1;
  }
  if (adjustedMinutes >= 60) {
    adjustedMinutes -= 60;
    adjustedDegrees += 1;
  }

  const paddedMinutes = String(adjustedMinutes).padStart(2, '0');
  const paddedSeconds = seconds.toFixed(1).padStart(4, '0');
  return `${adjustedDegrees} ${paddedMinutes}'${paddedSeconds}"${hemisphere}`;
};

const pointPopupHtml = (latlng: L.LatLng) => {
  const { lat } = latlng;
  const { lng } = latlng;
  return `
    <div class="cwm-markup-point-popup">
      <strong>Draw Point</strong>
      <div>Latitude: ${formatDms(lat, 'lat')}</div>
      <div>Longitude: ${formatDms(lng, 'lng')}</div>
      <div>Decimal: ${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
    </div>
  `;
};

/**
 * CWM v1.7.2 Markup Tools > Draw Point parity.
 *
 * The legacy tool is `DrawPointMarkup`: it activates a point handler,
 * waits for one map click, adds a red star symbol (`#f44336`, size 25),
 * then leaves the symbol editable. In Leaflet we model that as a
 * draggable marker with a CSS star divIcon and expose it through the
 * same SparMapContext bridge pattern used by MeasureControl.
 */
const MarkupPointLayer = () => {
  const map = useMap();
  const { _setMapControls } = useSparMap();
  const markersRef = useRef<L.Marker[]>([]);
  const pendingClickRef = useRef<((e: L.LeafletMouseEvent) => void) | null>(null);

  useEffect(() => {
    const container = map.getContainer?.();
    const resetCursor = () => {
      if (container?.style) container.style.cursor = '';
    };

    const cancelPendingClick = () => {
      if (pendingClickRef.current) {
        map.off('click', pendingClickRef.current);
        pendingClickRef.current = null;
      }
      resetCursor();
    };

    const bindCoordinatePopup = (marker: L.Marker) => {
      const latlng = marker.getLatLng();
      marker
        .setTooltipContent(`${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`)
        .bindPopup(pointPopupHtml(latlng));
    };

    const addMarkupPoint = (latlng: L.LatLng, openPopup = true) => {
      const marker = L.marker(latlng, {
        icon: cwmMarkupPointIcon,
        draggable: true,
        keyboard: true,
        title: `Draw Point ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`
      });
      marker.bindTooltip(`${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`);
      bindCoordinatePopup(marker);
      marker.on('dragend', () => bindCoordinatePopup(marker));
      marker.addTo(map);
      if (openPopup) marker.openPopup();
      markersRef.current.push(marker);
    };

    const startDrawPoint = (coordinate?: MarkupPointCoordinate) => {
      cancelPendingClick();
      if (coordinate) {
        const latlng = L.latLng(coordinate.lat, coordinate.lng);
        addMarkupPoint(latlng);
        map.setView(latlng, Math.max(map.getZoom(), 12), { animate: false });
        return;
      }

      if (container?.style) container.style.cursor = 'crosshair';

      const handleClick = (event: L.LeafletMouseEvent) => {
        pendingClickRef.current = null;
        resetCursor();
        addMarkupPoint(event.latlng);
      };

      pendingClickRef.current = handleClick;
      map.once('click', handleClick);
    };

    const clearMarkupPoints = () => {
      cancelPendingClick();
      markersRef.current.forEach((marker) => {
        try {
          marker.remove();
        } catch {
          map.removeLayer(marker);
        }
      });
      markersRef.current = [];
    };

    _setMapControls({
      startDrawPoint,
      clearMarkupPoints,
      cancelDrawPoint: cancelPendingClick
    });

    return () => {
      cancelPendingClick();
      clearMarkupPoints();
      _setMapControls({
        startDrawPoint: null,
        clearMarkupPoints: null,
        cancelDrawPoint: null
      });
    };
  }, [map, _setMapControls]);

  return null;
};

export default MarkupPointLayer;
