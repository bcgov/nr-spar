package ca.bc.gov.oracleapi.config;

import com.zaxxer.hikari.HikariDataSource;
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
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Data source configuration for CONSEP (read-write) repositories. Scans {@code
 * repository/consep/} using a read-write Oracle database account.
 */
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "ca.bc.gov.oracleapi.repository.consep",
    entityManagerFactoryRef = "readWriteEntityManagerFactory",
    transactionManagerRef = "readWriteTransactionManager")
public class ReadWriteDataSourceConfig {

  @Bean
  @ConfigurationProperties("spring.datasource.readwrite")
  public DataSourceProperties readWriteDataSourceProperties() {
    return new DataSourceProperties();
  }

  @Bean
  @ConfigurationProperties("spring.datasource.readwrite.hikari")
  public HikariDataSource readWriteDataSource(
      @Qualifier("readWriteDataSourceProperties") DataSourceProperties properties) {
    return properties.initializeDataSourceBuilder().type(HikariDataSource.class).build();
  }

  @Bean
  public LocalContainerEntityManagerFactoryBean readWriteEntityManagerFactory(
      EntityManagerFactoryBuilder builder,
      @Qualifier("readWriteDataSource") DataSource dataSource,
      Environment env) {
    Map<String, String> jpaProps = new HashMap<>();
    jpaProps.put(
        "hibernate.dialect",
        env.getProperty(
            "spring.jpa.properties.hibernate.dialect", "org.hibernate.dialect.OracleDialect"));
    jpaProps.put("hibernate.temp.use_jdbc_metadata_defaults", "false");
    String ddlAuto = env.getProperty("spring.jpa.hibernate.ddl-auto");
    if (ddlAuto != null) {
      jpaProps.put("hibernate.hbm2ddl.auto", ddlAuto);
    }
    return builder
        .dataSource(dataSource)
        .packages("ca.bc.gov.oracleapi.entity")
        .persistenceUnit("readwrite")
        .properties(jpaProps)
        .build();
  }

  @Bean
  public PlatformTransactionManager readWriteTransactionManager(
      @Qualifier("readWriteEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
    return new JpaTransactionManager(entityManagerFactory);
  }
}
