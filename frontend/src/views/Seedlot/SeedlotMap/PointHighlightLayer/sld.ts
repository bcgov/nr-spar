/**
 * Inline GeoServer SLD body that overrides the default seedlot/veglot
 * point styling with a 10px red circle. Used by `<PointHighlightLayer>`
 * to paint either the SEED_SEEDLOT_POINT_MVW or SEED_VEG_LOT_POINT_MVW
 * record matching the URL `seedlot=` / `veglot=` param.
 *
 * Mirrors the legacy CWM `initQueryLayer('SEEDLOT', '...', '#FF0000')`
 * call from `sparmap.js` themeAoua/themeAoub. The NamedLayer field is
 * left blank because the WMS request itself supplies the layer name —
 * GeoServer 2.x accepts the SLD as the styling part only when the
 * cql_filter + layers params drive the feature selection.
 */
const POINT_HIGHLIGHT_SLD_BODY = `<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0"
  xmlns="http://www.opengis.net/sld"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <Name>__POINT_LAYER__</Name>
    <UserStyle>
      <FeatureTypeStyle>
        <Rule>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill>
                  <CssParameter name="fill">#FF0000</CssParameter>
                </Fill>
                <Stroke>
                  <CssParameter name="stroke">#000000</CssParameter>
                  <CssParameter name="stroke-width">1</CssParameter>
                </Stroke>
              </Mark>
              <Size>10</Size>
            </Graphic>
          </PointSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>`;

/**
 * Build the SLD body for a specific WMS layer name. GeoServer requires
 * the `<NamedLayer><Name>` to match the WMS `layers=` parameter, so we
 * substitute the layer name into the template at request build time.
 */
export const buildPointHighlightSldBody = (layerName: string): string => POINT_HIGHLIGHT_SLD_BODY.replace('__POINT_LAYER__', layerName);
