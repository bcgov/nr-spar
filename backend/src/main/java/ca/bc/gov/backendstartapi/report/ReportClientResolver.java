package ca.bc.gov.backendstartapi.report;

import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.dto.ForestClientLocationDto;
import ca.bc.gov.backendstartapi.service.ForestClientService;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Resolves the client names, acronyms and addresses that SPAR stores only as client and location
 * codes.
 *
 * <p>A single report repeats the same client across the applicant, collection, storage and
 * ownership bands, so lookups are memoized. Instances are scoped to one report and are therefore
 * not Spring beans.
 */
final class ReportClientResolver {

  private final ForestClientService forestClientService;
  private final Map<String, ClientDisplay> resolved = new HashMap<>();

  ReportClientResolver(ForestClientService forestClientService) {
    this.forestClientService = forestClientService;
  }

  ClientDisplay resolve(String clientNumber, String locationCode) {
    if (clientNumber == null || clientNumber.isBlank()) {
      return ClientDisplay.empty();
    }
    return resolved.computeIfAbsent(
        clientNumber + "|" + (locationCode == null ? "" : locationCode),
        key -> fetch(clientNumber, locationCode));
  }

  private ClientDisplay fetch(String clientNumber, String locationCode) {
    Optional<ForestClientDto> client = forestClientService.fetchClient(clientNumber);
    return new ClientDisplay(
        client.map(ForestClientDto::acronym).orElse(null),
        client.map(ForestClientDto::clientName).orElse(null),
        formatAddress(fetchLocation(clientNumber, locationCode)));
  }

  private ForestClientLocationDto fetchLocation(String clientNumber, String locationCode) {
    if (locationCode == null || locationCode.isBlank()) {
      return null;
    }
    try {
      return forestClientService.fetchSingleClientLocation(clientNumber, locationCode);
    } catch (ResponseStatusException e) {
      // ForestClientApiProvider wraps 4xx as ResponseStatusException. Address is optional on the
      // report; keep the remaining client details when the location is missing.
      if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
        return null;
      }
      throw e;
    }
  }

  private static String formatAddress(ForestClientLocationDto location) {
    if (location == null) {
      return null;
    }
    List<String> parts = new ArrayList<>();
    addPart(parts, location.address1());
    addPart(parts, location.address2());
    addPart(parts, location.address3());
    addPart(parts, location.city());
    addPart(parts, location.province());
    addPart(parts, location.postalCode());
    return parts.isEmpty() ? null : String.join(", ", parts);
  }

  private static void addPart(List<String> parts, String value) {
    if (value != null && !value.isBlank()) {
      parts.add(value.trim());
    }
  }
}
