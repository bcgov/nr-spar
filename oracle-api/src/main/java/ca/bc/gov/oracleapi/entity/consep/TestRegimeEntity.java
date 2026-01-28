package ca.bc.gov.oracleapi.entity.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * This class represents the data of test regime related to requests in CONSEP.
 */
@Getter
@Setter
@Entity
@Table(name = "CNS_T_TEST_REGIME", schema = "CONSEP")
@Schema(description = "Represents the data in the test regime table")
public class TestRegimeEntity {
  @Id
  @Column(name = "SEEDLOT_TEST_CODE", length = 3, nullable = false)
  private String seedlotTestCode;

  @Column(name = "SOAK_HOURS", precision = 5)
  private Integer soakHours;

  @Column(name = "STRAT_HOURS", precision = 5)
  private Integer stratHours;

  @Column(name = "COUNT_HOURS", precision = 5)
  private Integer countHours;

  @Column(name = "WARM_STRAT_HOURS", precision = 5)
  private Integer warmStratHours;

  @Column(name = "GERMINATOR_TEMPERATURE", length = 25)
  private String germinatorTemperature;
}
