import 'leaflet';

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
