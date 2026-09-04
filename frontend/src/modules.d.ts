declare module '@carbon/react';
declare module '@carbon/icons-react';
declare module '@carbon/pictograms-react';

declare module 'leaflet.control.layers.tree';

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
