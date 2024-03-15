package ca.bc.gov.backendstartapi.filter;

/** This class repreents a Request Correlation for distributed log tracing. */
public class RequestCorrelation {
  public static final String CORRELATION_ID_HEADER = "correlationId";
  private static final ThreadLocal<String> id = new ThreadLocal<String>();

  /**
   * Get the Header value.
   *
   * @return The correlation id, if any.
   */
  public static String getId() {
    return id.get();
  }

  /**
   * Sets the Header value.
   *
   * @param correlationId The id to be set.
   */
  public static void setId(String correlationId) {
    id.set(correlationId);
  }
}
