package ca.bc.gov.oracleapi.config;

import ca.bc.gov.oracleapi.filter.CorrelationHeaderFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** This class creates a Bean for the Log Tracing filter. */
@Configuration
public class FilterConfig {

  /**
   * Creates a CorrelationHeaderFilter.
   *
   * @return FilterRegistrationBean
   */
  @Bean
  public FilterRegistrationBean<CorrelationHeaderFilter> correlationHeaderFilter() {
    FilterRegistrationBean<CorrelationHeaderFilter> filterRegBean = new FilterRegistrationBean<>();
    filterRegBean.setFilter(new CorrelationHeaderFilter());
    filterRegBean.addUrlPatterns("/api/*");
    filterRegBean.setOrder(1);
    return filterRegBean;
  }
}
