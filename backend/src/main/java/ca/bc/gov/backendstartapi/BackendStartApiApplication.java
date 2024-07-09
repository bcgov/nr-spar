package ca.bc.gov.backendstartapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

/** Starting point of the service app. */
@SpringBootApplication
@EnableAspectJAutoProxy(proxyTargetClass = true)
public class BackendStartApiApplication {

  public static void main(String[] args) {
    SpringApplication.run(BackendStartApiApplication.class, args);
  }
}
