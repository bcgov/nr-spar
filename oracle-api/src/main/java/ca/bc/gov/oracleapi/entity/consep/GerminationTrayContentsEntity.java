package ca.bc.gov.oracleapi.entity.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "CNS58TRAYCONTENTS", schema = "CONSEP")
@Schema(description = "Represents a germinator tray contents in the CONSEP database.")
public class GerminationTrayContentsEntity {

  @Column(name = "GERMINATOR_TRAY_ID", precision = 5, scale = 0, nullable = false)
  private Integer germinatorTrayId;

  @Column(name = "VEGETATION_ST", length = 8)
  private String vegetationSt;

  @Column(name = "ACTIVITY_TYPE_CD", length = 3, nullable = false)
  private String activityTypeCd;

  @Column(name = "ACTUAL_START_DATE")
  private LocalDateTime actualStartDate;

  @Column(name = "DATE_CREATED", nullable = false)
  private LocalDateTime dateCreated;

  @Id
  @Column(name = "RIA_SKEY", precision = 10, scale = 0, nullable = false)
  private BigDecimal riaSkey;

  @Column(name = "REQUEST_ID", length = 11)
  private String requestId;

  @Column(name = "REQUEST_SKEY", precision = 10, scale = 0)
  private Long requestSkey;

  @Column(name = "ITEM_ID", length = 1)
  private String itemId;

  @Column(name = "REQUEST_TYPE_ST", length = 3)
  private String requestTypeSt;

  @Column(name = "SEEDLOT_NUMBER", length = 13)
  private String seedlotNumber;

  @Column(name = "SOAK_START_DATE")
  private LocalDateTime soakStartDate;

  @Column(name = "SOAK_END_DATE")
  private LocalDateTime soakEndDate;

  @Column(name = "SEED_WITHDRAWAL_DATE")
  private LocalDateTime seedWithdrawDate;

  @Column(name = "WARM_STRAT_START_DATE")
  private LocalDateTime warmStratStartDate;

  @Column(name = "DRYBACK_START_DATE")
  private LocalDateTime drybackStartDate;

  @Column(name = "GERMINATOR_ENTRY")
  private LocalDateTime germinatorEntry;

  @Column(name = "STRAT_START_DT")
  private LocalDateTime stratStartDate;

  @Column(name = "GERMINATOR_ID", length = 1)
  private String germinatorId;

  @Column(name = "STNDRD_ACTIVITY_ID", length = 3)
  private String standardActivityId;

  @Column(name = "TEST_CATEGORY_CD", length = 3)
  private String testCategoryCd;

  @Column(name = "TEST_COMPLETE_IND", precision = 5, scale = 0)
  private Integer testCompleteInd;

  @Column(name = "ACCEPT_RESULT_IND", precision = 5, scale = 0)
  private Integer acceptResultInd;
}
