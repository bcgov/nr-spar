package ca.bc.gov.oracleapi.entity.consep;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * This class represents the data of standard activities related to requests in CONSEP.
 */
@Getter
@Setter
@Entity
@Table(name = "CNS_T_STNDRD_ACTIVITY", schema = "CONSEP")
public class StandardActivityEntity {

  @Id
  @Column(name = "STNDRD_ACTIVITY_ID", length = 3, nullable = false)
  private String standardActivityId;

  @Column(name = "ACTIVITY_TYPE_CD", length = 3)
  private String activityTypeCode;

  @Column(name = "TEST_CATEGORY_CD", length = 3)
  private String testCategoryCode;

  @Column(name = "SIGNIFICNT_STS_IND", precision = 5)
  private Integer significantStatusIndicator;

  @Column(name = "ACTIVITY_DURATION", precision = 5)
  private Integer activityDuration;

  @Column(name = "ACTVTY_TM_UNIT_ST", length = 3)
  private String activityTimeUnit;

  @Column(name = "ACTIVITY_DESC", length = 30)
  private String activityDesc;
}