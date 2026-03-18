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
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;


@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "ca.bc.gov.oracleapi.repository.consep",
    entityManagerFactoryRef = "consepEntityManagerFactory",
    transactionManagerRef = "consepTransactionManager"
)
public class ConsepDataSourceConfig {

  @Bean
  @ConfigurationProperties("consep.datasource")
  public DataSourceProperties consepDataSourceProperties() {
    return new DataSourceProperties();
  }

  @Bean
  public DataSource consepDataSource() {
    // JVM truststore is already set globally
    return consepDataSourceProperties()
        .initializeDataSourceBuilder()
        .type(com.zaxxer.hikari.HikariDataSource.class) // explicitly Hikari
        .build();
  }

  @Bean
  public LocalContainerEntityManagerFactoryBean consepEntityManagerFactory(
      EntityManagerFactoryBuilder builder,
      @Qualifier("consepDataSource") DataSource dataSource) {

    Map<String, Object> properties = new HashMap<>();
    properties.put("hibernate.dialect", "org.hibernate.dialect.OracleDialect");
    properties.put("hibernate.temp.use_jdbc_metadata_defaults", false);

    return builder
        .dataSource(dataSource)
        .packages("ca.bc.gov.oracleapi.entity.consep")
        .persistenceUnit("consep")
        .properties(properties)
        .build();
  }

  @Bean
  public PlatformTransactionManager consepTransactionManager(
      @Qualifier("consepEntityManagerFactory")
      EntityManagerFactory emf) {

    return new JpaTransactionManager(emf);
  }
}