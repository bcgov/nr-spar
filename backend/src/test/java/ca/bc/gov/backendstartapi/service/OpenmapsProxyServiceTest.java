package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.exception.OpenmapsProxyException;
import ca.bc.gov.backendstartapi.util.CollectionAreaLimits;
import java.net.URI;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

@ExtendWith(SpringExtension.class)
class OpenmapsProxyServiceTest {

  @Mock private RestTemplate restTemplate;

  private OpenmapsProxyService service;

  @BeforeEach
  void setup() {
    service =
        new OpenmapsProxyService(
            restTemplate, "https://openmaps.gov.bc.ca", "/geo/pub/ows", "/geo/pub/wms");
  }

  private static MultiValueMap<String, String> wfsQuery() {
    MultiValueMap<String, String> query = new LinkedMultiValueMap<>();
    query.add("service", "WFS");
    query.add("version", "2.0.0");
    query.add("request", "GetFeature");
    query.add("typeNames", "pub:WHSE_FOREST_VEGETATION.SEED_SEEDLOT_POINT_MVW");
    query.add("outputFormat", "application/json");
    query.add("count", "500");
    query.add(
        "CQL_FILTER", "BBOX(GEOMETRY,-126.6,54.1,-126.3,54.2,'EPSG:4326') AND ACTIVE_IND='YES'");
    return query;
  }

  private void stubUpstreamOk() {
    when(restTemplate.exchange(
            any(URI.class), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
        .thenReturn(ResponseEntity.ok("{\"type\":\"FeatureCollection\",\"features\":[]}"));
  }

  /** Capture the POST the service made upstream, for URI and form-body assertions. */
  @SuppressWarnings("unchecked")
  private static MultiValueMap<String, String> formBodyOf(HttpEntity<?> entity) {
    return (MultiValueMap<String, String>) entity.getBody();
  }

  @Test
  @DisplayName("POSTs a valid WFS query to the hard-coded OpenMaps host")
  void forwardValidWfs() {
    stubUpstreamOk();

    String body = service.forward(wfsQuery());

    assertEquals("{\"type\":\"FeatureCollection\",\"features\":[]}", body);
    ArgumentCaptor<URI> uriCaptor = ArgumentCaptor.forClass(URI.class);
    ArgumentCaptor<HttpEntity<?>> entityCaptor = ArgumentCaptor.forClass(HttpEntity.class);
    verify(restTemplate)
        .exchange(
            uriCaptor.capture(),
            eq(HttpMethod.POST),
            entityCaptor.capture(),
            eq(String.class));

    URI uri = uriCaptor.getValue();
    assertEquals("https", uri.getScheme());
    assertEquals("openmaps.gov.bc.ca", uri.getHost());
    assertEquals("/geo/pub/ows", uri.getPath());
    // The parameters must ride in the body, not the URL — that is the whole point.
    assertNull(uri.getQuery());

    HttpEntity<?> entity = entityCaptor.getValue();
    MultiValueMap<String, String> form = formBodyOf(entity);
    assertEquals(
        "pub:WHSE_FOREST_VEGETATION.SEED_SEEDLOT_POINT_MVW", form.getFirst("typeNames"));
    assertTrue(form.getFirst("CQL_FILTER").startsWith("BBOX(GEOMETRY,"));
    assertEquals(
        MediaType.APPLICATION_FORM_URLENCODED, entity.getHeaders().getContentType());
    assertTrue(entity.getHeaders().getAccept().stream()
        .anyMatch(type -> "application/json".equals(type.toString())));
    assertTrue(entity.getHeaders().get("Authorization") == null
        || entity.getHeaders().get("Authorization").isEmpty());
  }

  @Test
  @DisplayName("forwards a CQL_FILTER far larger than any URL could carry")
  void forwardsOversizedCqlFilter() {
    // A 2000-vertex collection area serialises to roughly 76 KB of WKT. This is
    // the case that used to 400 before the upstream call switched to POST.
    StringBuilder ring = new StringBuilder("INTERSECTS(GEOMETRY,POLYGON((");
    for (int i = 0; i < 2000; i++) {
      ring.append(1200000.1234567 + i).append(' ').append(460000.7654321 + i).append(", ");
    }
    ring.append("1200000.1234567 460000.7654321)))");
    String hugeCql = ring.toString();
    assertTrue(hugeCql.length() > 60_000);

    MultiValueMap<String, String> query = wfsQuery();
    query.set("CQL_FILTER", hugeCql);
    stubUpstreamOk();

    service.forward(query);

    ArgumentCaptor<HttpEntity<?>> entityCaptor = ArgumentCaptor.forClass(HttpEntity.class);
    verify(restTemplate)
        .exchange(any(URI.class), eq(HttpMethod.POST), entityCaptor.capture(), eq(String.class));
    assertEquals(hugeCql, formBodyOf(entityCaptor.getValue()).getFirst("CQL_FILTER"));
  }

  @Test
  @DisplayName("forwards GetLegendGraphic to the WMS path")
  void forwardValidLegend() {
    MultiValueMap<String, String> query = new LinkedMultiValueMap<>();
    query.add("service", "WMS");
    query.add("version", "1.3.0");
    query.add("request", "GetLegendGraphic");
    query.add("layer", "pub:WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_20K_SPG");
    query.add("format", "application/json");
    query.add("style", "1411");
    query.add("LEGEND_OPTIONS", "hideEmptyRules:true");
    query.add("srs", "EPSG:3005");
    query.add("width", "600");
    query.add("height", "400");
    query.add("bbox", "959229.3,1010027.0,975584.7,1022905.8");

    when(restTemplate.exchange(
            any(URI.class), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
        .thenReturn(ResponseEntity.ok("{\"Legend\":[]}"));

    service.forward(query);

    ArgumentCaptor<URI> uriCaptor = ArgumentCaptor.forClass(URI.class);
    verify(restTemplate)
        .exchange(uriCaptor.capture(), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class));
    assertEquals("/geo/pub/wms", uriCaptor.getValue().getPath());
  }

  @Test
  @DisplayName("rejects GetMap so the proxy cannot be used as an open tile relay")
  void rejectGetMap() {
    MultiValueMap<String, String> query = new LinkedMultiValueMap<>();
    query.add("service", "WMS");
    query.add("request", "GetMap");
    query.add("layer", "pub:WHSE_FOREST_VEGETATION.SEED_PLAN_ZONE_POLY_MVW");
    query.add("format", "application/json");

    OpenmapsProxyException ex =
        assertThrows(OpenmapsProxyException.class, () -> service.forward(query));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
  }

  @Test
  @DisplayName("rejects a user-supplied host or url parameter")
  void rejectUrlParam() {
    MultiValueMap<String, String> query = wfsQuery();
    query.add("url", "https://evil.example/steal");

    OpenmapsProxyException ex =
        assertThrows(OpenmapsProxyException.class, () -> service.forward(query));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
  }

  @Test
  @DisplayName("rejects a layer name that is not a BCGW typeName")
  void rejectBadLayer() {
    MultiValueMap<String, String> query = wfsQuery();
    query.set("typeNames", "http://evil.example/x");

    assertThrows(OpenmapsProxyException.class, () -> service.forward(query));
  }

  @Test
  @DisplayName("rejects a count above the cap")
  void rejectHugeCount() {
    MultiValueMap<String, String> query = wfsQuery();
    query.set("count", "99999");

    assertThrows(OpenmapsProxyException.class, () -> service.forward(query));
  }

  @Test
  @DisplayName("defaults count when the caller omits it")
  void defaultCountWhenAbsent() {
    MultiValueMap<String, String> query = wfsQuery();
    query.remove("count");

    stubUpstreamOk();

    service.forward(query);

    ArgumentCaptor<HttpEntity<?>> entityCaptor = ArgumentCaptor.forClass(HttpEntity.class);
    verify(restTemplate)
        .exchange(any(URI.class), eq(HttpMethod.POST), entityCaptor.capture(), eq(String.class));
    assertEquals("5000", formBodyOf(entityCaptor.getValue()).getFirst("count"));
  }

  @Test
  @DisplayName("rejects CQL with a statement separator or comment")
  void rejectHostileCql() {
    MultiValueMap<String, String> query = wfsQuery();
    query.set("CQL_FILTER", "ZONE='IDF';DROP TABLE x");

    OpenmapsProxyException ex =
        assertThrows(OpenmapsProxyException.class, () -> service.forward(query));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
  }

  @Test
  @DisplayName("maps upstream HTTP errors to 502 without leaking the body")
  void upstreamError() {
    when(restTemplate.exchange(
            any(URI.class), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
        .thenThrow(new HttpClientErrorException(HttpStatus.FORBIDDEN));

    MultiValueMap<String, String> query = wfsQuery();
    OpenmapsProxyException ex =
        assertThrows(OpenmapsProxyException.class, () -> service.forward(query));
    assertEquals(HttpStatus.BAD_GATEWAY, ex.getStatusCode());
  }

  @Test
  @DisplayName("rejects a WFS layer SPAR does not query")
  void rejectWfsLayerOutsideAllowlist() {
    MultiValueMap<String, String> query = wfsQuery();
    query.set("typeNames", "pub:WHSE_FOREST_VEGETATION.VEG_COMP_LYR_R1_POLY");

    OpenmapsProxyException ex =
        assertThrows(OpenmapsProxyException.class, () -> service.forward(query));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals("Layer is not allowed", ex.getReason());
  }

  @Test
  @DisplayName("rejects a CQL_FILTER beyond what the vertex cap could produce")
  void rejectOverlongCql() {
    MultiValueMap<String, String> query = wfsQuery();
    // Derived cap is MAX_VERTICES * 45 + 1000, so this is comfortably past it.
    query.set("CQL_FILTER", "A".repeat((CollectionAreaLimits.MAX_VERTICES * 45) + 1_001));

    OpenmapsProxyException ex =
        assertThrows(OpenmapsProxyException.class, () -> service.forward(query));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals("CQL_FILTER is too long", ex.getReason());
  }

  @Test
  @DisplayName("accepts BCGW typeNames with optional pub: prefix")
  void allowedLayerNames() {
    String seedlotLayer = "pub:WHSE_FOREST_VEGETATION.SEED_SEEDLOT_POINT_MVW";
    assertTrue(OpenmapsProxyService.isAllowedLayerName(seedlotLayer));
    assertTrue(
        OpenmapsProxyService.isAllowedLayerName(
            "whse_forest_vegetation.seed_seedlot_point_mvw"));
    assertFalse(OpenmapsProxyService.isAllowedLayerName("SEED_SEEDLOT_POINT_MVW"));
    assertFalse(OpenmapsProxyService.isAllowedLayerName("http://evil.example/x"));
  }

  @Test
  @DisplayName("maps an empty upstream body to 502")
  void emptyUpstreamBody() {
    when(restTemplate.exchange(
            any(URI.class), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
        .thenReturn(ResponseEntity.ok().build());

    var query = wfsQuery();
    OpenmapsProxyException ex =
        assertThrows(OpenmapsProxyException.class, () -> service.forward(query));
    assertEquals(HttpStatus.BAD_GATEWAY, ex.getStatusCode());
    assertEquals("OpenMaps returned an empty body", ex.getReason());
  }

  @Test
  @DisplayName("maps a timeout or network error to 504")
  void upstreamTimeout() {
    when(restTemplate.exchange(
            any(URI.class), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
        .thenThrow(new ResourceAccessException("Read timed out"));

    var query = wfsQuery();
    OpenmapsProxyException ex =
        assertThrows(OpenmapsProxyException.class, () -> service.forward(query));
    assertEquals(HttpStatus.GATEWAY_TIMEOUT, ex.getStatusCode());
    assertEquals("OpenMaps request timed out", ex.getReason());
  }

  @Test
  @DisplayName("rejects a legend graphic width or height above the dimension cap")
  void rejectHugeLegendDimension() {
    MultiValueMap<String, String> query = new LinkedMultiValueMap<>();
    query.add("service", "WMS");
    query.add("version", "1.3.0");
    query.add("request", "GetLegendGraphic");
    query.add("layer", "pub:WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_20K_SPG");
    query.add("format", "application/json");
    query.add("width", "99999");
    query.add("height", "400");

    OpenmapsProxyException ex =
        assertThrows(OpenmapsProxyException.class, () -> service.forward(query));
    assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    assertEquals("Invalid width", ex.getReason());
  }

  @Test
  @DisplayName("still forwards when openmaps.base-url has a trailing slash")
  void trailingSlashBaseUrlStillForwards() {
    OpenmapsProxyService slashed =
        new OpenmapsProxyService(
            restTemplate, "https://openmaps.gov.bc.ca/", "/geo/pub/ows", "/geo/pub/wms");

    stubUpstreamOk();

    String body = slashed.forward(wfsQuery());

    assertEquals("{\"type\":\"FeatureCollection\",\"features\":[]}", body);
    ArgumentCaptor<URI> uriCaptor = ArgumentCaptor.forClass(URI.class);
    verify(restTemplate)
        .exchange(
            uriCaptor.capture(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class));
    assertEquals("openmaps.gov.bc.ca", uriCaptor.getValue().getHost());
    // The trailing slash must not survive into the path as "//geo/pub/ows".
    assertEquals("/geo/pub/ows", uriCaptor.getValue().getPath());
  }

  @Test
  @DisplayName("origin comparison ignores trailing slash and default HTTPS port")
  void sameOpenmapsOriginIsSlashAndPortTolerant() {
    URI configured = URI.create("https://openmaps.gov.bc.ca/");
    URI built = URI.create("https://openmaps.gov.bc.ca/geo/pub/ows?service=WFS");
    assertTrue(OpenmapsProxyService.sameOpenmapsOrigin(configured, built));

    URI withPort = URI.create("https://openmaps.gov.bc.ca:443");
    assertTrue(OpenmapsProxyService.sameOpenmapsOrigin(withPort, built));

    URI otherHost = URI.create("https://evil.example");
    assertFalse(OpenmapsProxyService.sameOpenmapsOrigin(otherHost, built));
  }
}
