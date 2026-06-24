/**
 * SPAR Map — end-to-end tests for the React-Leaflet POC
 *
 * Covers the core user workflows:
 *   - Draw polygon → validate → submit (with BEC zone derivation)
 *   - Import GeoJSON file → verify polygons loaded
 *   - Clear Last / Clear All
 *   - Export menu
 *   - Print button
 *   - BCGW Layer Catalog toggle
 *   - Identify tool
 *   - Multi-polygon draw + validate
 *
 * Auth: uses the existing cy.login() from cypress/support/commands.ts
 * which performs the full IDIR redirect dance. Requires standard Cypress
 * env vars (USERNAME, PASSWORD, LOGIN_SERVICE).
 *
 * Backend: the POST /api/seedlots/:seedlotNumber/aoi endpoint is
 * intercepted so tests run without a live backend. The openmaps WFS
 * (BEC zone derivation) is also intercepted.
 */
describe('SPAR Map — AOI polygon round-trip', () => {
  const seedlotNumber = '12345';
  const mapUrl = `/seedlots/map/${seedlotNumber}?theme=COLAREA`;
  const mapSelector = '.leaflet-container';

  beforeEach(() => {
    // Stub the backend AOI save endpoint
    cy.intercept('POST', `**/api/seedlots/${seedlotNumber}/aoi`, {
      statusCode: 200,
      body: {
        seedlotNumber,
        ok: true,
        savedAt: '2026-04-10T00:00:00Z',
        becZones: ['CDF']
      }
    }).as('saveAoi');

    // Stub the openmaps WFS BEC zone derivation call
    cy.intercept('GET', '**/openmaps.gov.bc.ca/geo/pub/ows*', {
      statusCode: 200,
      body: {
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', properties: { ZONE: 'CDF' }, geometry: null }
        ]
      }
    }).as('becWfs');

    // cy.login() requires IDIR credentials via Cypress env vars. When
    // running locally without credentials, skip login — the DEV-LOCAL
    // bypass in AuthProvider auto-assigns a fake client role so the app
    // works without real auth. In CI the env vars are set and login runs.
    const username = Cypress.env('USERNAME');
    if (username) {
      cy.login();
    }
  });

  /**
   * Helper: wait for the map page, leaflet container, and AOI toolbar
   * to be visible before interacting with the map.
   */
  const waitForMap = () => {
    cy.visit(mapUrl);
    cy.getByDataTest('seedlot-map-page').should('be.visible');
    cy.getByDataTest('leaflet-map').should('be.visible');
    cy.getByDataTest('aoi-toolbar').should('be.visible');
  };

  /**
   * Helper: draw a square polygon using the AOI toolbar's Add Polygon
   * button + 4 viewport clicks + double-click to finish.
   */
  const drawSquare = () => {
    cy.getByDataTest('aoi-add-polygon').click();
    const points: Array<[number, number]> = [
      [300, 200],
      [500, 200],
      [500, 400],
      [300, 400]
    ];
    points.forEach(([x, y]) => cy.get(mapSelector).click(x, y, { force: true }));
    // Double-click to finish the polygon
    cy.get(mapSelector).dblclick(300, 200, { force: true });
  };

  // ── Draw + Submit ───────────────────────────────────────────────

  it('draws a polygon, validates it, submits with BEC zones in the payload', () => {
    waitForMap();

    // Initially polygon-dependent buttons are disabled
    cy.getByDataTest('aoi-submit').should('be.disabled');
    cy.getByDataTest('aoi-validate').should('be.disabled');
    cy.getByDataTest('aoi-clear-all').should('be.disabled');

    drawSquare();

    // After drawing, polygon-dependent buttons become enabled
    cy.getByDataTest('aoi-submit').should('not.be.disabled');
    cy.getByDataTest('aoi-validate').should('not.be.disabled');
    cy.getByDataTest('aoi-clear-all').should('not.be.disabled');

    // Validate
    cy.getByDataTest('aoi-validate').click();
    cy.getByDataTest('aoi-validation-notification').should('be.visible');

    // Submit
    cy.getByDataTest('aoi-submit').click();

    // Verify the BEC WFS derivation fired
    cy.wait('@becWfs');

    // Verify the POST payload contains polygon + becZones
    cy.wait('@saveAoi').its('request.body').should((body: any) => {
      expect(body).to.have.property('polygon');
      expect(body.polygon).to.have.property('type', 'Feature');
      expect(body.polygon.geometry).to.have.property('type');
      expect(body.polygon.geometry.coordinates).to.be.an('array').and.not.be.empty;
      expect(body).to.have.property('becZones');
      expect(body.becZones).to.be.an('array');
    });

    // Success notification
    cy.getByDataTest('aoi-save-success').should('be.visible');
  });

  // ── File Import ─────────────────────────────────────────────────

  it('imports a GeoJSON file and loads polygons onto the map', () => {
    waitForMap();

    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-123.5, 48.5], [-123.4, 48.5],
              [-123.4, 48.6], [-123.5, 48.6],
              [-123.5, 48.5]
            ]]
          },
          properties: { name: 'Test AOI' }
        }
      ]
    };

    // Attach the file to the hidden file input
    cy.getByDataTest('aoi-import-shape-input').selectFile(
      {
        contents: Cypress.Buffer.from(JSON.stringify(geojson)),
        fileName: 'test.geojson',
        mimeType: 'application/geo+json'
      },
      { force: true }
    );

    // After import, submit should become enabled (polygon was loaded)
    cy.getByDataTest('aoi-submit').should('not.be.disabled', { timeout: 5000 });
  });

  // ── Clear Last / Clear All ──────────────────────────────────────

  it('Clear Last removes the most recent polygon, Clear All removes everything', () => {
    waitForMap();

    // Draw first polygon
    drawSquare();
    cy.getByDataTest('aoi-submit').should('not.be.disabled');

    // Clear Last — removes the polygon, buttons go back to disabled
    cy.getByDataTest('aoi-clear-last').click();
    cy.getByDataTest('aoi-submit').should('be.disabled');

    // Draw two polygons
    drawSquare();
    cy.getByDataTest('aoi-add-polygon').click();
    cy.get(mapSelector).click(100, 100, { force: true });
    cy.get(mapSelector).click(200, 100, { force: true });
    cy.get(mapSelector).click(200, 200, { force: true });
    cy.get(mapSelector).dblclick(100, 200, { force: true });

    // Clear All — everything gone
    cy.getByDataTest('aoi-clear-all').click();
    cy.getByDataTest('aoi-submit').should('be.disabled');
  });

  // ── Export Menu ─────────────────────────────────────────────────

  it('Export menu opens with format options when polygons exist', () => {
    waitForMap();
    drawSquare();

    cy.getByDataTest('aoi-export').click();
    // Carbon Modal should appear with format radio buttons
    cy.contains('Export').should('be.visible');
    cy.contains('GeoJSON').should('be.visible');
    cy.contains('KML').should('be.visible');
  });

  // ── Print ───────────────────────────────────────────────────────

  it('Print button exists and is always enabled', () => {
    waitForMap();

    // Print should be enabled even with no polygons drawn
    cy.getByDataTest('aoi-print').should('not.be.disabled');
  });

  // ── BCGW Layer Catalog ──────────────────────────────────────────

  it('Layer Catalog modal opens and lists DataBC layers', () => {
    waitForMap();

    cy.getByDataTest('aoi-layer-catalog').click();
    cy.getByDataTest('layer-catalog-modal').should('be.visible');

    // Verify some known catalog layers appear as checkboxes
    cy.contains('Parcel Fabric (PMBC)').should('be.visible');
    cy.contains('Resource Roads').should('be.visible');
    cy.contains('Forest Tenure Cut Blocks').should('be.visible');
    cy.contains('Vegetation Resources Inventory').should('be.visible');
  });

  it('toggling a catalog layer checkbox adds it to the map', () => {
    // Stub WMS tile requests for the catalog layer
    cy.intercept('GET', '**/openmaps.gov.bc.ca/geo/pub/wms*', {
      statusCode: 200,
      headers: { 'content-type': 'image/png' },
      body: Cypress.Buffer.from('') // empty transparent tile
    }).as('wmsTile');

    waitForMap();

    cy.getByDataTest('aoi-layer-catalog').click();
    cy.getByDataTest('catalog-layer-pmbc-parcels').click();

    // Close the modal
    cy.get('.cds--modal-close').click();

    // The layer name should now appear in the Leaflet LayersControl
    cy.get('.leaflet-control-layers').trigger('mouseover');
    cy.contains('Parcel Fabric (PMBC)').should('be.visible');
  });

  // ── Identify Tool ───────────────────────────────────────────────

  it('Identify tool toggles cursor and can be activated/deactivated', () => {
    waitForMap();

    // Identify is off by default — map should not have the identify-active class
    cy.get(mapSelector).should('not.have.class', 'identify-active');

    // Click the Identify button to activate
    cy.getByDataTest('aoi-identify').click();
    cy.get(mapSelector).should('have.class', 'identify-active');

    // Click again to deactivate
    cy.getByDataTest('aoi-identify').click();
    cy.get(mapSelector).should('not.have.class', 'identify-active');
  });

  // ── Multi-polygon + Validate ────────────────────────────────────

  it('supports drawing multiple polygons and validating them', () => {
    waitForMap();

    // Draw first polygon
    drawSquare();

    // Draw second polygon (different location)
    cy.getByDataTest('aoi-add-polygon').click();
    cy.get(mapSelector).click(100, 100, { force: true });
    cy.get(mapSelector).click(200, 100, { force: true });
    cy.get(mapSelector).click(200, 200, { force: true });
    cy.get(mapSelector).dblclick(100, 200, { force: true });

    // Validate — should succeed for two non-overlapping polygons
    cy.getByDataTest('aoi-validate').click();
    cy.getByDataTest('aoi-validation-notification').should('be.visible');

    // Submit sends a MultiPolygon (buildMultiPolygonFeature combines them)
    cy.getByDataTest('aoi-submit').click();
    cy.wait('@saveAoi').its('request.body').should((body: any) => {
      expect(body.polygon.geometry.type).to.equal('MultiPolygon');
      expect(body.polygon.geometry.coordinates).to.have.length(2);
    });
  });
});
