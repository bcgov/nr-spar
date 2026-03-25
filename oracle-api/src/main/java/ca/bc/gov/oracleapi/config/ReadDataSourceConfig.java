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
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Data source configuration for SPAR (read-only) repositories. Scans {@code repository/} but
 * excludes {@code repository/consep/} which is handled by the read-write data source.
 */
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "ca.bc.gov.oracleapi.repository",
    excludeFilters =
        @ComponentScan.Filter(
            type = FilterType.REGEX,
            pattern = "ca\\.bc\\.gov\\.oracleapi\\.repository\\.consep\\..*"),
    entityManagerFactoryRef = "readEntityManagerFactory",
    transactionManagerRef = "readTransactionManager")
public class ReadDataSourceConfig {

  @Primary
  @Bean
  @ConfigurationProperties("spring.datasource.read")
  public DataSourceProperties readDataSourceProperties() {
    return new DataSourceProperties();
  }

  @Primary
  @Bean
  @ConfigurationProperties("spring.datasource.read.hikari")
  public HikariDataSource readDataSource(
      @Qualifier("readDataSourceProperties") DataSourceProperties properties) {
    return properties.initializeDataSourceBuilder().type(HikariDataSource.class).build();
  }

  @Primary
  @Bean
  public LocalContainerEntityManagerFactoryBean readEntityManagerFactory(
      EntityManagerFactoryBuilder builder,
      @Qualifier("readDataSource") DataSource dataSource,
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
        .persistenceUnit("read")
        .properties(jpaProps)
        .build();
  }

  @Primary
  @Bean
  public PlatformTransactionManager readTransactionManager(
      @Qualifier("readEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
    return new JpaTransactionManager(entityManagerFactory);
  }
}
