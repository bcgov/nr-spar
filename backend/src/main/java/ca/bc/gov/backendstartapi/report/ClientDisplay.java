package ca.bc.gov.backendstartapi.report;

/**
 * The Forest Client details a report band prints for one client and location.
 *
 * @param acronym the client acronym, null when the client is unknown
 * @param name the client name, null when the client is unknown
 * @param address the single-line location address, null when no location was resolved
 */
record ClientDisplay(String acronym, String name, String address) {

  private static final ClientDisplay EMPTY = new ClientDisplay(null, null, null);

  static ClientDisplay empty() {
    return EMPTY;
  }
}
