package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.exception.OpenmapsProxyException;
import ca.bc.gov.backendstartapi.util.CollectionAreaLimits;
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
import org.springframework.beans.factory.annotation.Value;
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

  private static final String PARAM_SERVICE = "service";
  private static final String PARAM_VERSION = "version";
  private static final String PARAM_REQUEST = "request";
  private static final String PARAM_TYPENAMES = "typenames";
  private static final String PARAM_TYPENAME = "typename";
  private static final String PARAM_LAYER = "layer";
  private static final String PARAM_LAYERS = "layers";
  private static final String PARAM_OUTPUTFORMAT = "outputformat";
  private static final String PARAM_FORMAT = "format";
  private static final String PARAM_SRSNAME = "srsname";
  private static final String PARAM_SRS = "srs";
  private static final String PARAM_CRS = "crs";
  private static final String PARAM_COUNT = "count";
  private static final String PARAM_MAXFEATURES = "maxfeatures";
  private static final String PARAM_CQL_FILTER = "cql_filter";
  private static final String PARAM_PROPERTYNAME = "propertyname";
  private static final String PARAM_STYLE = "style";
  private static final String PARAM_STYLES = "styles";
  private static final String PARAM_LEGEND_OPTIONS = "legend_options";
  private static final String PARAM_WIDTH = "width";
  private static final String PARAM_HEIGHT = "height";
  private static final String PARAM_BBOX = "bbox";

  private static final int MAX_FEATURES = 5000;

  /**
   * Worst-case cost of one collection-area vertex inside a WKT filter: two
   * unrounded BC Albers ordinates, their space, and the {@code ", "} separator.
   */
  private static final int CQL_CHARS_PER_VERTEX = 45;

  /**
   * CQL_FILTER ceiling, derived from the collection-area vertex cap so the two
   * limits cannot drift apart. WFS queries are POSTed upstream, so this is a
   * bound on how much work we are willing to ask OpenMaps to do — not a
   * transport limit. It must stay above what {@code MAX_VERTICES} can produce,
   * otherwise a polygon we accept for storage could not be BEC-validated.
   */
  private static final int MAX_CQL_LENGTH =
      (CollectionAreaLimits.MAX_VERTICES * CQL_CHARS_PER_VERTEX) + 1_000;

  private static final int MAX_DIMENSION = 4096;

  /**
   * WFS GetFeature layers SPAR actually queries. GetLegendGraphic still
   * uses the BCGW name pattern so catalog/theme overlays can show a legend.
   */
  private static final Set<String> ALLOWED_WFS_LAYERS =
      Set.of(
          "WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY",
          "WHSE_FOREST_VEGETATION.SEED_PLAN_ZONE_POLY_MVW",
          "WHSE_FOREST_VEGETATION.SEED_SEEDLOT_POINT_MVW",
          "WHSE_FOREST_VEGETATION.SEED_VEG_LOT_POINT_MVW",
          "WHSE_ADMIN_BOUNDARIES.ADM_NR_DISTRICTS_SPG",
          "WHSE_BASEMAPPING.TRIM_CONTOUR_LINES",
          "WHSE_BASEMAPPING.BC_SPOT_ELEVATION_POINTS_500M");

  private static final Set<String> ALLOWED_PARAMS =
      Set.of(
          PARAM_SERVICE,
          PARAM_VERSION,
          PARAM_REQUEST,
          PARAM_TYPENAMES,
          PARAM_TYPENAME,
          PARAM_LAYER,
          PARAM_LAYERS,
          PARAM_OUTPUTFORMAT,
          PARAM_FORMAT,
          PARAM_SRSNAME,
          PARAM_SRS,
          PARAM_CRS,
          PARAM_COUNT,
          PARAM_MAXFEATURES,
          PARAM_CQL_FILTER,
          PARAM_PROPERTYNAME,
          PARAM_STYLE,
          PARAM_STYLES,
          PARAM_LEGEND_OPTIONS,
          PARAM_WIDTH,
          PARAM_HEIGHT,
          PARAM_BBOX);

  /** One BCGW name segment ({@code WHSE_FOREST_VEGETATION}, {@code SEED_SEEDLOT_POINT_MVW}). */
  private static final Pattern LAYER_PART =
      Pattern.compile("^[A-Z][A-Z0-9_]*$", Pattern.CASE_INSENSITIVE);
  private static final Pattern PROPERTY_NAME = Pattern.compile("^[A-Za-z0-9_,]+$");
  private static final Pattern STYLE = Pattern.compile("^[A-Za-z0-9_,-]+$");
  private static final Pattern SRS = Pattern.compile("^EPSG:\\d+$", Pattern.CASE_INSENSITIVE);
  private static final Pattern BBOX =
      Pattern.compile("^-?\\d+(\\.\\d+)?(,-?\\d+(\\.\\d+)?){3}$");
  private static final Pattern VERSION = Pattern.compile("^\\d+\\.\\d+(\\.\\d+)?$");
  private static final Pattern LEGEND_OPTIONS = Pattern.compile("^hideEmptyRules:true$");
  /**
   * CQL_FILTER charset. Covers BBOX / INTERSECTS / CONTAINS / DWITHIN, quoted
   * literals including {@code 'EPSG:4326'}, numeric IN-lists, and WKT. Rejects
   * statement separators, comments, and anything that isn't a SPAR-shaped
   * predicate.
   */
  private static final Pattern CQL_SAFE = Pattern.compile("[A-Za-z0-9_,.'()=: \\-+\\[\\]]+");

  private final RestTemplate restTemplate;
  private final String openmapsBaseUrl;
  private final URI openmapsBaseUri;
  private final String wfsPath;
  private final String wmsPath;

  @Autowired
  OpenmapsProxyService(
      RestTemplateBuilder templateBuilder,
      @Value("${openmaps.base-url}") String openmapsBaseUrl,
      @Value("${openmaps.wfs-path}") String wfsPath,
      @Value("${openmaps.wms-path}") String wmsPath) {
    this(
        templateBuilder
            .connectTimeout(Duration.ofSeconds(5))
            .readTimeout(Duration.ofSeconds(25))
            .build(),
        openmapsBaseUrl,
        wfsPath,
        wmsPath);
  }

  OpenmapsProxyService(
      RestTemplate restTemplate, String openmapsBaseUrl, String wfsPath, String wmsPath) {
    this.restTemplate = restTemplate;
    this.openmapsBaseUrl = stripTrailingSlash(openmapsBaseUrl);
    this.openmapsBaseUri = URI.create(this.openmapsBaseUrl);
    this.wfsPath = wfsPath;
    this.wmsPath = wmsPath;
  }

  /**
   * Validate the caller query, forward it to the configured OpenMaps host, and return the JSON
   * body. Never forwards the SPAR Authorization header.
   */
  public String forward(MultiValueMap<String, String> rawQuery) {
    Map<String, String> query = flattenAndNormalize(rawQuery);
    rejectUnknownParams(query);

    String service = required(query, PARAM_SERVICE).toUpperCase(Locale.ROOT);
    String request = required(query, PARAM_REQUEST);
    validateVersion(query.get(PARAM_VERSION));

    String path;
    boolean wfsGetFeature;
    if ("WFS".equals(service) && equalsIgnoreCase(request, "GetFeature")) {
      path = wfsPath;
      wfsGetFeature = true;
      validateWfs(query);
    } else if ("WMS".equals(service) && equalsIgnoreCase(request, "GetLegendGraphic")) {
      path = wmsPath;
      wfsGetFeature = false;
      validateWmsLegend(query);
    } else {
      throw new OpenmapsProxyException(
          HttpStatus.BAD_REQUEST, "Only WFS GetFeature and WMS GetLegendGraphic are allowed");
    }

    SparLog.info("OpenMaps proxy {} {}", service, request);

    try {
      // GetFeature carries the collection-area WKT, which routinely exceeds any
      // URL length limit, so it goes upstream as a form-encoded POST. Legend
      // requests are small and stay on GET.
      ResponseEntity<String> response =
          wfsGetFeature ? postUpstream(path, query) : getUpstream(path, query);
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

  private ResponseEntity<String> getUpstream(String path, Map<String, String> query) {
    HttpHeaders headers = new HttpHeaders();
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    return restTemplate.exchange(
        buildOpenmapsUri(path, query), HttpMethod.GET, new HttpEntity<>(headers), String.class);
  }

  private ResponseEntity<String> postUpstream(String path, Map<String, String> query) {
    HttpHeaders headers = new HttpHeaders();
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
    return restTemplate.exchange(
        buildOpenmapsUri(path),
        HttpMethod.POST,
        new HttpEntity<>(canonicalParams(query), headers),
        String.class);
  }

  /**
   * Target URI with no query string, for the POST form binding. Origin-checked
   * exactly like the GET variant so neither path can leave the OpenMaps host.
   */
  URI buildOpenmapsUri(String path) {
    URI uri =
        UriComponentsBuilder.fromUriString(openmapsBaseUrl).path(path).encode().build().toUri();
    if (!sameOpenmapsOrigin(openmapsBaseUri, uri)) {
      throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "Refusing to leave OpenMaps host");
    }
    return uri;
  }

  private static MultiValueMap<String, String> canonicalParams(Map<String, String> query) {
    MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
    query.forEach((key, value) -> params.add(canonicalParamName(key), value));
    return params;
  }

  URI buildOpenmapsUri(String path, Map<String, String> query) {
    MultiValueMap<String, String> params = canonicalParams(query);
    URI uri =
        UriComponentsBuilder.fromUriString(openmapsBaseUrl)
            .path(path)
            .queryParams(params)
            .encode()
            .build()
            .toUri();
    if (!sameOpenmapsOrigin(openmapsBaseUri, uri)) {
      throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "Refusing to leave OpenMaps host");
    }
    return uri;
  }

  private static String stripTrailingSlash(String value) {
    String trimmed = value.trim();
    while (trimmed.endsWith("/")) {
      trimmed = trimmed.substring(0, trimmed.length() - 1);
    }
    return trimmed;
  }

  /**
   * Compare scheme + host + effective port so a trailing slash or explicit
   * default port in {@code openmaps.base-url} cannot 400 every proxy call.
   */
  static boolean sameOpenmapsOrigin(URI configured, URI built) {
    if (configured.getScheme() == null
        || configured.getHost() == null
        || built.getScheme() == null
        || built.getHost() == null) {
      return false;
    }
    return configured.getScheme().equalsIgnoreCase(built.getScheme())
        && configured.getHost().equalsIgnoreCase(built.getHost())
        && effectivePort(configured) == effectivePort(built);
  }

  private static int effectivePort(URI uri) {
    if (uri.getPort() != -1) {
      return uri.getPort();
    }
    if ("https".equalsIgnoreCase(uri.getScheme())) {
      return 443;
    }
    if ("http".equalsIgnoreCase(uri.getScheme())) {
      return 80;
    }
    return -1;
  }

  private static void validateWfs(Map<String, String> query) {
    requireJsonFormat(firstPresent(query, PARAM_OUTPUTFORMAT, PARAM_FORMAT));
    validateLayer(firstPresent(query, PARAM_TYPENAMES, PARAM_TYPENAME), true);
    validateOptional(query, PARAM_SRSNAME, SRS, "Invalid srsName");
    validateOptional(query, PARAM_SRS, SRS, "Invalid srs");
    validateOptional(query, PARAM_CRS, SRS, "Invalid crs");
    validateOptional(query, PARAM_PROPERTYNAME, PROPERTY_NAME, "Invalid propertyName");
    validateOptional(query, PARAM_BBOX, BBOX, "Invalid bbox");
    applyDefaultCount(query);
    validateCount(firstPresent(query, PARAM_COUNT, PARAM_MAXFEATURES));
    validateCql(query.get(PARAM_CQL_FILTER));
  }

  private static void validateWmsLegend(Map<String, String> query) {
    requireJsonFormat(firstPresent(query, PARAM_FORMAT, PARAM_OUTPUTFORMAT));
    validateLayer(firstPresent(query, PARAM_LAYER, PARAM_LAYERS), false);
    validateOptional(query, PARAM_STYLE, STYLE, "Invalid style");
    validateOptional(query, PARAM_STYLES, STYLE, "Invalid styles");
    validateOptional(query, PARAM_SRS, SRS, "Invalid srs");
    validateOptional(query, PARAM_CRS, SRS, "Invalid crs");
    validateOptional(query, PARAM_LEGEND_OPTIONS, LEGEND_OPTIONS, "Invalid LEGEND_OPTIONS");
    validateOptional(query, PARAM_BBOX, BBOX, "Invalid bbox");
    validateDimension(query.get(PARAM_WIDTH), PARAM_WIDTH);
    validateDimension(query.get(PARAM_HEIGHT), PARAM_HEIGHT);
  }

  private static void validateLayer(String layer, boolean wfsGetFeature) {
    if (layer == null || layer.isBlank()) {
      throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "Layer name is required");
    }
    String first = layer.split(",")[0].trim();
    if (!isAllowedLayerName(first)) {
      throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "Invalid layer name");
    }
    if (layer.contains(",")) {
      throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "Only one layer is allowed");
    }
    if (wfsGetFeature && !ALLOWED_WFS_LAYERS.contains(canonicalLayerName(first))) {
      throw new OpenmapsProxyException(HttpStatus.BAD_REQUEST, "Layer is not allowed");
    }
  }

  /**
   * BCGW typeNames are {@code SCHEMA.LAYER} with an optional {@code pub:} prefix.
   * Parts are checked independently so the pattern cannot stack-overflow.
   */
  static boolean isAllowedLayerName(String layer) {
    String name = layer;
    if (name.regionMatches(true, 0, "pub:", 0, 4)) {
      name = name.substring(4);
    }
    String[] parts = name.split("\\.", -1);
    if (parts.length < 2) {
      return false;
    }
    for (String part : parts) {
      if (!LAYER_PART.matcher(part).matches()) {
        return false;
      }
    }
    return true;
  }

  private static String canonicalLayerName(String layer) {
    String trimmed = layer.trim();
    if (trimmed.regionMatches(true, 0, "pub:", 0, 4)) {
      trimmed = trimmed.substring(4);
    }
    return trimmed.toUpperCase(Locale.ROOT);
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
    if (firstPresent(query, PARAM_COUNT, PARAM_MAXFEATURES) == null) {
      query.put(PARAM_COUNT, String.valueOf(MAX_FEATURES));
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
      case PARAM_TYPENAMES -> "typeNames";
      case PARAM_TYPENAME -> "typeName";
      case PARAM_OUTPUTFORMAT -> "outputFormat";
      case PARAM_SRSNAME -> "srsName";
      case PARAM_MAXFEATURES -> "maxFeatures";
      case PARAM_CQL_FILTER -> "CQL_FILTER";
      case PARAM_PROPERTYNAME -> "propertyName";
      case PARAM_LEGEND_OPTIONS -> "LEGEND_OPTIONS";
      default -> key;
    };
  }
}
