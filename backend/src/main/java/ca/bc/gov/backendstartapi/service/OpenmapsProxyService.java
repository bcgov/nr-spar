package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.exception.OpenmapsProxyException;
import java.net.URI;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Allowlisted, host-locked proxy for DataBC OpenMaps JSON (WFS GetFeature and WMS
 * GetLegendGraphic). The browser must not call OpenMaps directly — GeoServer does not send CORS
 * headers for SPAR origins. Tiles stay browser-direct and are gated by the frontend CSP img-src
 * allowlist.
 */
@Service
public class OpenmapsProxyService {

  static final String OPENMAPS_BASE_URL = "https://openmaps.gov.bc.ca";
  static final String WFS_PATH = "/geo/pub/ows";
  static final String WMS_PATH = "/geo/pub/wms";

  private static final int MAX_FEATURES = 5000;
  private static final int MAX_CQL_LENGTH = 65536;
  private static final int MAX_DIMENSION = 4096;

  private static final Set<String> ALLOWED_PARAMS =
      Set.of(
          "service",
          "version",
          "request",
          "typenames",
          "typename",
          "layer",
          "layers",
          "outputformat",
          "format",
          "srsname",
          "srs",
          "crs",
          "count",
          "maxfeatures",
          "cql_filter",
          "propertyname",
          "style",
          "styles",
          "legend_options",
          "width",
          "height",
          "bbox");

  private static final Pattern LAYER_NAME =
      Pattern.compile("^(pub:)?[A-Z][A-Z0-9_]*(\\.[A-Z][A-Z0-9_]*)+$", Pattern.CASE_INSENSITIVE);
  private static final Pattern PROPERTY_NAME = Pattern.compile("^[A-Za-z0-9_,]+$");
  private static final Pattern STYLE = Pattern.compile("^[A-Za-z0-9_,-]+$");
  private static final Pattern SRS = Pattern.compile("^EPSG:\\d+$", Pattern.CASE_INSENSITIVE);
  private static final Pattern BBOX =
      Pattern.compile("^-?\\d+(\\.\\d+)?(,-?\\d+(\\.\\d+)?){3}$");
  private static final Pattern VERSION = Pattern.compile("^\\d+\\.\\d+(\\.\\d+)?$");
  private static final Pattern LEGEND_OPTIONS = Pattern.compile("^hideEmptyRules:true$");
  /**
   * CQL_FILTER charset. Covers BBOX / INTERSECTS / CONTAINS / DWITHIN, quoted
   * literals, numeric IN-lists, and WKT. Rejects statement separators, comments,
   * and anything that isn't a SPAR-shaped predicate.
   */
  private static final Pattern CQL_SAFE = Pattern.compile("[A-Za-z0-9_,.'()= \\-+\\[\\]]+");

  private final RestTemplate restTemplate;

  @Autowired
  OpenmapsProxyService(RestTemplateBuilder templateBuilder) {
    this(
        templateBuilder
            .connectTimeout(Duration.ofSeconds(5))
            .readTimeout(Duration.ofSeconds(25))
            .build());
  }

  OpenmapsProxyService(RestTemplate restTemplate) {
    this.restTemplate = restTemplate;
  }

  /**
   * Validate the caller query, forward it to the hard-coded OpenMaps host, and return the JSON
   * body. Never forwards the SPAR Authorization header.
   */
  public String forward(MultiValueMap<String, String> rawQuery) {
    Map<String, String> query = flattenAndNormalize(rawQuery);
    rejectUnknownParams(query);

    String service = required(query, "service").toUpperCase(Locale.ROOT);
    String request = required(query, "request");
    validateVersion(query.get("version"));

    String path;
    if ("WFS".equals(service) && equalsIgnoreCase(request, "GetFeature")) {
      path = WFS_PATH;
      validateWfs(query);
    } else if ("WMS".equals(service) && equalsIgnoreCase(request, "GetLegendGraphic")) {
      path = WMS_PATH;
      validateWmsLegend(query);
    } else {
      throw new OpenmapsProxyException(
          HttpStatus.BAD_REQUEST, "Only WFS GetFeature and WMS GetLegendGraphic are allowed");
    }

    URI uri = buildOpenmapsUri(path, query);
    SparLog.info("OpenMaps proxy {} {}", service, request);

    HttpHeaders headers = new HttpHeaders();
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    try {
      ResponseEntity<String> response =
          restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
      if (response.getBody() == null) {
        throw new OpenmapsProxyException(HttpStatus.BAD_GATEWAY, "OpenMaps returned an empty body");
      }
      return response.getBody();
    } catch (HttpStatusCodeException ex) {
      SparLog.warn("OpenMaps upstream HTTP {}", ex.getStatusCode().value());
      throw new OpenmapsProxyException(HttpStatus.BAD_GATEWAY, "OpenMaps request failed");
    } catch (ResourceAccessException ex) {
      SparLog.warn("OpenMaps upstream timeout or network error");
      throw new OpenmapsProxyException(HttpStatus.GATEWAY_TIMEOUT, "OpenMaps request timed out");
    }
  }

  URI buildOpenmapsUri(String path, Map<String, String> query) {
    MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
    query.forEach((key, value) -> params.add(canonicalParamName(key), value));
    URI uri =
        UriComponentsBuilder.fromUriString(OPENMAPS_BASE_URL)
            .path(path)
            .queryParams(params)
            .encode()
            .build()
            .toUri();
    if (!OPENMAPS_BASE_URL.equals(uri.getScheme() + "://" + uri.getHost())
        || uri.getPort() != -1) {
      throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "Refusing to leave OpenMaps host");
    }
    return uri;
  }

  private void validateWfs(Map<String, String> query) {
    requireJsonFormat(firstPresent(query, "outputformat", "format"));
    validateLayer(firstPresent(query, "typenames", "typename"));
    validateOptional(query, "srsname", SRS, "Invalid srsName");
    validateOptional(query, "srs", SRS, "Invalid srs");
    validateOptional(query, "crs", SRS, "Invalid crs");
    validateOptional(query, "propertyname", PROPERTY_NAME, "Invalid propertyName");
    validateOptional(query, "bbox", BBOX, "Invalid bbox");
    applyDefaultCount(query);
    validateCount(firstPresent(query, "count", "maxfeatures"));
    validateCql(query.get("cql_filter"));
  }

  private void validateWmsLegend(Map<String, String> query) {
    requireJsonFormat(firstPresent(query, "format", "outputformat"));
    validateLayer(firstPresent(query, "layer", "layers"));
    validateOptional(query, "style", STYLE, "Invalid style");
    validateOptional(query, "styles", STYLE, "Invalid styles");
    validateOptional(query, "srs", SRS, "Invalid srs");
    validateOptional(query, "crs", SRS, "Invalid crs");
    validateOptional(query, "legend_options", LEGEND_OPTIONS, "Invalid LEGEND_OPTIONS");
    validateOptional(query, "bbox", BBOX, "Invalid bbox");
    validateDimension(query.get("width"), "width");
    validateDimension(query.get("height"), "height");
  }

  private static void validateLayer(String layer) {
    if (layer == null || layer.isBlank()) {
      throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "Layer name is required");
    }
    String first = layer.split(",")[0].trim();
    if (!LAYER_NAME.matcher(first).matches()) {
      throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "Invalid layer name");
    }
    if (layer.contains(",")) {
      throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "Only one layer is allowed");
    }
  }

  private static void requireJsonFormat(String format) {
    if (format == null || !format.toLowerCase(Locale.ROOT).startsWith("application/json")) {
      throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "Only application/json is allowed");
    }
  }

  private static void validateVersion(String version) {
    if (version != null && !VERSION.matcher(version).matches()) {
      throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "Invalid version");
    }
  }

  /**
   * Feature count is optional at the GeoServer level, which would let any
   * authenticated caller request a province-wide layer with no cap. Default
   * it so {@link #MAX_FEATURES} is always in force.
   */
  private static void applyDefaultCount(Map<String, String> query) {
    if (firstPresent(query, "count", "maxfeatures") == null) {
      query.put("count", String.valueOf(MAX_FEATURES));
    }
  }

  private static void validateCount(String count) {
    if (count == null) {
      return;
    }
    try {
      int value = Integer.parseInt(count);
      if (value < 1 || value > MAX_FEATURES) {
        throw new OpenmapsProxyException(
            HttpStatus.BAD_REQUEST, "count must be between 1 and " + MAX_FEATURES);
      }
    } catch (NumberFormatException ex) {
      throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "Invalid count");
    }
  }

  private static void validateDimension(String value, String name) {
    if (value == null) {
      return;
    }
    try {
      int parsed = Integer.parseInt(value);
      if (parsed < 1 || parsed > MAX_DIMENSION) {
        throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "Invalid " + name);
      }
    } catch (NumberFormatException ex) {
      throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "Invalid " + name);
    }
  }

  private static void validateCql(String cql) {
    if (cql == null) {
      return;
    }
    if (cql.length() > MAX_CQL_LENGTH) {
      throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "CQL_FILTER is too long");
    }
    if (cql.contains(";") || cql.contains("--") || cql.contains("/*") || cql.contains("*/")) {
      throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "Invalid CQL_FILTER");
    }
    if (!CQL_SAFE.matcher(cql).matches()) {
      throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "Invalid CQL_FILTER");
    }
  }

  private static void validateOptional(
      Map<String, String> query, String key, Pattern pattern, String message) {
    String value = query.get(key);
    if (value != null && !pattern.matcher(value).matches()) {
      throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, message);
    }
  }

  private static void rejectUnknownParams(Map<String, String> query) {
    for (String key : query.keySet()) {
      if (!ALLOWED_PARAMS.contains(key)) {
        throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "Unsupported parameter: " + key);
      }
    }
  }

  private static Map<String, String> flattenAndNormalize(MultiValueMap<String, String> rawQuery) {
    Map<String, String> normalized = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
    if (rawQuery != null) {
      rawQuery.forEach(
          (key, values) -> {
            if (key != null && values != null && !values.isEmpty() && values.get(0) != null) {
              normalized.put(key.toLowerCase(Locale.ROOT), values.get(0));
            }
          });
    }
    return new LinkedHashMap<>(normalized);
  }

  private static String required(Map<String, String> query, String key) {
    String value = query.get(key);
    if (value == null || value.isBlank()) {
      throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, key + " is required");
    }
    return value;
  }

  private static String firstPresent(Map<String, String> query, String... keys) {
    for (String key : keys) {
      String value = query.get(key);
      if (value != null && !value.isBlank()) {
        return value;
      }
    }
    return null;
  }

  private static boolean equalsIgnoreCase(String left, String right) {
    return left != null && left.equalsIgnoreCase(right);
  }

  /** GeoServer accepts mixed case, but SPAR always sends the conventional names. */
  private static String canonicalParamName(String key) {
    return switch (key) {
      case "typenames" -> "typeNames";
      case "typename" -> "typeName";
      case "outputformat" -> "outputFormat";
      case "srsname" -> "srsName";
      case "maxfeatures" -> "maxFeatures";
      case "cql_filter" -> "CQL_FILTER";
      case "propertyname" -> "propertyName";
      case "legend_options" -> "LEGEND_OPTIONS";
      default -> key;
    };
  }
}
