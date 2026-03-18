package ca.bc.gov.oracleapi.config;

import jakarta.persistence.EntityManagerFactory;
import java.util.HashMap;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "ca.bc.gov.oracleapi.repository.spar",
    entityManagerFactoryRef = "sparEntityManagerFactory",
    transactionManagerRef = "sparTransactionManager"
)
public class SparDataSourceConfig {

  @Primary
  @Bean
  @ConfigurationProperties("spring.datasource")
  public DataSourceProperties sparDataSourceProperties() {
    return new DataSourceProperties();
  }

  @Primary
  @Bean
  @ConfigurationProperties("spring.datasource.hikari")
  public DataSource sparDataSource() {
    return sparDataSourceProperties()
        .initializeDataSourceBuilder()
        .build();
  }

  @Primary
  @Bean
  public LocalContainerEntityManagerFactoryBean sparEntityManagerFactory(
      EntityManagerFactoryBuilder builder,
      @Qualifier("sparDataSource") DataSource dataSource) {

    Map<String, Object> properties = new HashMap<>();
    properties.put("hibernate.dialect", "org.hibernate.dialect.OracleDialect");
    properties.put("hibernate.temp.use_jdbc_metadata_defaults", false);

    return builder
        .dataSource(dataSource)
        .packages("ca.bc.gov.oracleapi.entity.spar")
        .persistenceUnit("spar")
        .properties(properties)
        .build();
  }

  @Primary
  @Bean
  public PlatformTransactionManager sparTransactionManager(
      @Qualifier("sparEntityManagerFactory")
      EntityManagerFactory emf) {

    return new JpaTransactionManager(emf);
  }
}