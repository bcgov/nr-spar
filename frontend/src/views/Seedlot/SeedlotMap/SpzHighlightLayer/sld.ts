/**
 * Inline GeoServer SLD body that overrides the default SPZ
 * (Seed Plan Zone) layer styling with a translucent blue polygon.
 * Used by `<SpzHighlightLayer>` to highlight the SPZ records matching
 * the URL `spzid=` CSV.
 *
 * Mirrors the legacy CWM `initQueryLayer('SPZ', ids, '#0090ff')` call
 * from `sparmap.js` themeAoua/themeAoub.
 */
export const SPZ_HIGHLIGHT_SLD_BODY = `<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0"
  xmlns="http://www.opengis.net/sld"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <Name>pub:WHSE_FOREST_VEGETATION.SEED_PLAN_ZONE_POLY_MVW</Name>
    <UserStyle>
      <FeatureTypeStyle>
        <Rule>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#0090ff</CssParameter>
              <CssParameter name="fill-opacity">0.5</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#0000ff</CssParameter>
              <CssParameter name="stroke-width">2</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>`;
