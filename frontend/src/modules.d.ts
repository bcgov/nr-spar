declare module '@carbon/react';
declare module '@carbon/icons-react';
declare module '@carbon/pictograms-react';

declare module 'leaflet.control.layers.tree';

declare module 'leaflet' {
  namespace Control {
    namespace Layers {
      interface TreeObject {
        label: string;
        layer?: Layer;
        children?: TreeObject[];
        selectAllCheckbox?: boolean | string;
      }
    }
  }

  namespace control {
    namespace layers {
      function tree(
        baseTree: Control.Layers.TreeObject,
        overlayTree?: Control.Layers.TreeObject,
        options?: Control.LayersOptions & Record<string, unknown>
      ): Control.Layers;
    }
  }
}

declare module '@mapbox/shp-write' {
  import type { FeatureCollection } from 'geojson';

  export function zip<T extends 'blob' | 'arraybuffer' | 'base64' = 'blob'>(
    data: FeatureCollection,
    options?: {
      outputType?: T;
      folder?: string;
      types?: { point?: string; polygon?: string; line?: string; multipolygon?: string };
    }
  ): Promise<T extends 'blob' ? Blob : T extends 'arraybuffer' ? ArrayBuffer : string>;
}
