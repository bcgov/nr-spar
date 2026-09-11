const buildSldBody = (fillColor: string, fillOpacity: number, strokeColor: string): string => `<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0"
  xmlns="http://www.opengis.net/sld"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <Name>pub:WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY</Name>
    <UserStyle>
      <FeatureTypeStyle>
        <Rule>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">${fillColor}</CssParameter>
              <CssParameter name="fill-opacity">${fillOpacity}</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">${strokeColor}</CssParameter>
              <CssParameter name="stroke-width">1</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>`;

/**
 * Inline GeoServer SLD body that paints BEC zones in the legacy SPAR
 * gold colour with red stroke. Used for "suitable" BEC zones in the
 * AOUCBST / PLANTSITECBST themes. Mirrors the legacy CWM
 * `initQueryValues('BEC', ...)` defaults in `sparmapIdentifyBec.js`:
 * fill `#D5C262` at 0.3 opacity, stroke `#FF0301`.
 */
export const SUITABLE_SLD_BODY = buildSldBody('#D5C262', 0.3, '#FF0301');

/**
 * Inline GeoServer SLD body that overrides the default BEC layer rendering
 * with a translucent purple fill, used to highlight BEC zones flagged
 * "not suitable for species" via the legacy `_` suffix on the `beczone`
 * URL param. Mirrors the legacy CWM `initQueryLayer('BEC', codes, '#800080')`
 * call from `sparmap.js` themeAoucbst.
 */
export const NOT_SUITABLE_SLD_BODY = buildSldBody('#800080', 0.5, '#400040');
