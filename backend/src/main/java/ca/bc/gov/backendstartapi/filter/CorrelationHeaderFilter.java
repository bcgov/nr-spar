package ca.bc.gov.backendstartapi.filter;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Objects;
import java.util.UUID;

/** This class represents a Filter class for injecting the correlation header log. */
public class CorrelationHeaderFilter implements Filter {

  /** Filter a request looking for the right header. If not found, creates one. */
  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    final HttpServletRequest httpServletRequest = (HttpServletRequest) request;
    String currentCorrId = httpServletRequest.getHeader(RequestCorrelation.CORRELATION_ID_HEADER);

    if (!currentRequestIsAsyncDispatcher(httpServletRequest)) {
      if (Objects.isNull(currentCorrId)) {
        currentCorrId = UUID.randomUUID().toString();
      }

      RequestCorrelation.setId(currentCorrId);
    }

    chain.doFilter(httpServletRequest, response);
  }

  private boolean currentRequestIsAsyncDispatcher(HttpServletRequest httpServletRequest) {
    return httpServletRequest.getDispatcherType().equals(DispatcherType.ASYNC);
  }
}
