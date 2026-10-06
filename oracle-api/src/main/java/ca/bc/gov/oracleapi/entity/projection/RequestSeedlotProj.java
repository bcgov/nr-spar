package ca.bc.gov.oracleapi.entity.projection;

import java.math.BigDecimal;

/**
 * One row of the request-seedlot validation query: the request item the user typed, resolved
 * against the request and seedlot it belongs to.
 *
 * <p>{@code requestItem} is assembled in the query rather than stored -- see
 * {@code SparRequestRepository.findBySeedlotNumberAndRequestId}.
 */
public interface RequestSeedlotProj {
  String getRequestItem();

  BigDecimal getRequestSkey();

  String getItemId();

  String getSeedlotNumber();

  String getVegetationSt();
}
