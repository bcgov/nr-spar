package ca.bc.gov.oracleapi.extensions;

import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.testcontainers.containers.OracleContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@ExtendWith({SpringExtension.class})
@ContextConfiguration
public abstract class AbstractTestContainerIntegrationTest {

  static final OracleContainer database;

  static {
    database = new CustomOracleContainer();
    database.start();
  }

  @DynamicPropertySource
  static void registerDynamicProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url",database::getJdbcUrl);
    registry.add("spring.datasource.username",database::getUsername);
    registry.add("spring.datasource.password",database::getPassword);
  }

}
