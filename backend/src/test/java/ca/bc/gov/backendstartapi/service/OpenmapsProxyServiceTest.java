package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.exception.OpenmapsProxyException;
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
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@ExtendWith(SpringExtension.class)
class OpenmapsProxyServiceTest {

  @Mock private RestTemplate restTemplate;

  private OpenmapsProxyService service;

  @BeforeEach
  void setup() {
    service = new OpenmapsProxyService(restTemplate);
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

  @Test
  @DisplayName("forwards a valid WFS query to the hard-coded OpenMaps host")
  void forwardValidWfs() {
    when(restTemplate.exchange(
            any(URI.class), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
        .thenReturn(ResponseEntity.ok("{\"type\":\"FeatureCollection\",\"features\":[]}"));

    String body = service.forward(wfsQuery());

    assertEquals("{\"type\":\"FeatureCollection\",\"features\":[]}", body);
    ArgumentCaptor<URI> uriCaptor = ArgumentCaptor.forClass(URI.class);
    ArgumentCaptor<HttpEntity<?>> entityCaptor = ArgumentCaptor.forClass(HttpEntity.class);
    verify(restTemplate)
        .exchange(uriCaptor.capture(), eq(HttpMethod.GET), entityCaptor.capture(), eq(String.class));

    URI uri = uriCaptor.getValue();
    assertEquals("https", uri.getScheme());
    assertEquals("openmaps.gov.bc.ca", uri.getHost());
    assertEquals("/geo/pub/ows", uri.getPath());
    assertTrue(uri.getQuery().contains("typeNames="));
    assertTrue(uri.getQuery().contains("CQL_FILTER="));
    assertTrue(entityCaptor.getValue().getHeaders().getAccept().stream()
        .anyMatch(type -> "application/json".equals(type.toString())));
    assertTrue(entityCaptor.getValue().getHeaders().get("Authorization") == null
        || entityCaptor.getValue().getHeaders().get("Authorization").isEmpty());
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

    when(restTemplate.exchange(
            any(URI.class), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
        .thenReturn(ResponseEntity.ok("{\"type\":\"FeatureCollection\",\"features\":[]}"));

    service.forward(query);

    ArgumentCaptor<URI> uriCaptor = ArgumentCaptor.forClass(URI.class);
    verify(restTemplate)
        .exchange(uriCaptor.capture(), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class));
    assertTrue(uriCaptor.getValue().getQuery().contains("count=5000"));
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
            any(URI.class), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
        .thenThrow(new HttpClientErrorException(HttpStatus.FORBIDDEN));

    OpenmapsProxyException ex =
        assertThrows(OpenmapsProxyException.class, () -> service.forward(wfsQuery()));
    assertEquals(HttpStatus.BAD_GATEWAY, ex.getStatusCode());
  }
}
