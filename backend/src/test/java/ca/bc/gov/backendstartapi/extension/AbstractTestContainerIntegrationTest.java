package ca.bc.gov.backendstartapi.extension;

import java.util.UUID;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

@Testcontainers
@ExtendWith({SpringExtension.class})
@ContextConfiguration
public abstract class AbstractTestContainerIntegrationTest {

  static final PostgreSQLContainer database;

  static {
    database = (PostgreSQLContainer) new PostgreSQLContainer(
        DockerImageName
            .parse("postgis/postgis:13-master")
            .asCompatibleSubstituteFor("postgres")
    )
        .withDatabaseName("simple")
        .withUsername("simple")
        .withPassword(UUID.randomUUID().toString());
    database.start();
  }

  @DynamicPropertySource
  static void registerDynamicProperties(DynamicPropertyRegistry registry) {

    registry
        .add(
            "spring.datasource.url",
            () -> database
                .getJdbcUrl()
                .replace("hdbc:postgresql", "jdbc:tc:postgresql")
        );

    registry
        .add(
            "spring.datasource.username",
            database::getUsername
        );

    registry
        .add(
            "spring.datasource.password",
            database::getPassword
        );
  }
}
