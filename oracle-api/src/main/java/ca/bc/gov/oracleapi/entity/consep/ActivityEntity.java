package ca.bc.gov.oracleapi.entity.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/**
 * This class represents the data of moisture content cones in CONSEP.
 */
@Getter
@Setter
@Entity
@Table(name = "CNS_T_RQST_ITM_ACTVTY")
@Schema(description = "Represents the data of moisture content cones for a seedlot in the database")
public class ActivityEntity {

  @Id
  @Column(name = "RIA_SKEY", precision = 10, scale = 10)
  private BigDecimal riaKey;

  @Column(name = "TEST_CATEGORY_CD", length = 30)
  private String category;

  @Column(name = "ACTUAL_BEGIN_DT_TM")
  private LocalDate beginDate;

  @Column(name = "ACTUAL_END_DT_TM")
  private LocalDate endDate;
}
