import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react';

import { DEFAULT_BASE_LAYER_ID } from './layerDefs';

/**
 * Which map layers are on, their opacity, and the chosen base map.
 *
 * Kept apart from `SparMapContext` because opacity changes fire on every
 * slider step; only the Layers panel and `<MapLayersSync>` (which applies
 * this state to the Leaflet layers) subscribe to it.
 */
export interface MapLayersState {
  baseLayerId: string;
  /** Overlay / user-layer id → on or off. Missing means off. */
  visible: Record<string, boolean>;
  /** Overlay / user-layer id → opacity 0–1. Missing means 1. */
  opacity: Record<string, number>;
}

interface MapLayersContextValue extends MapLayersState {
  setBaseLayer: (id: string) => void;
  setLayersVisible: (ids: readonly string[], visible: boolean) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  /** Replace visibility + opacity, e.g. with a theme's defaults. */
  resetLayers: (state: Pick<MapLayersState, 'visible' | 'opacity'>) => void;
}

const MapLayersContext = createContext<MapLayersContextValue | undefined>(undefined);

export const MapLayersProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<MapLayersState>({
    baseLayerId: DEFAULT_BASE_LAYER_ID,
    visible: {},
    opacity: {}
  });

  const setBaseLayer = useCallback((id: string) => {
    setState((prev) => ({ ...prev, baseLayerId: id }));
  }, []);

  const setLayersVisible = useCallback((ids: readonly string[], visible: boolean) => {
    setState((prev) => {
      const next = { ...prev.visible };
      ids.forEach((id) => { next[id] = visible; });
      return { ...prev, visible: next };
    });
  }, []);

  const setLayerOpacity = useCallback((id: string, opacity: number) => {
    setState((prev) => ({ ...prev, opacity: { ...prev.opacity, [id]: opacity } }));
  }, []);

  const resetLayers = useCallback((next: Pick<MapLayersState, 'visible' | 'opacity'>) => {
    setState((prev) => ({ ...prev, visible: next.visible, opacity: next.opacity }));
  }, []);

  const value = useMemo<MapLayersContextValue>(() => ({
    ...state,
    setBaseLayer,
    setLayersVisible,
    setLayerOpacity,
    resetLayers
  }), [state, setBaseLayer, setLayersVisible, setLayerOpacity, resetLayers]);

  return <MapLayersContext.Provider value={value}>{children}</MapLayersContext.Provider>;
};

export const useMapLayers = (): MapLayersContextValue => {
  const ctx = useContext(MapLayersContext);
  if (!ctx) throw new Error('useMapLayers must be used inside MapLayersProvider');
  return ctx;
};
