package ca.bc.gov.oracleapi.entity.consep;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * Represents a germinator tray record in the CONSEP database.
 */
@Getter
@Setter
@Entity
@Table(name = "CNS_T_GERMINATOR_TRAY", schema = "CONSEP")
@Schema(
    description = "Represents a germinator tray record in the CONSEP database."
)
public class GerminatorTrayEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "GERMINATOR_TRAY_ID", precision = 5, nullable = false)
  private Integer germinatorTrayId;

  @Column(name = "ACTIVITY_TYPE_CD", length = 3, nullable = false)
  private String activityTypeCd;

  @Column(name = "ACTUAL_START_DATE")
  private LocalDateTime actualStartDate;

  @Column(name = "DATE_CREATED", nullable = false)
  private LocalDateTime dateCreated;

  @Column(name = "REVISION_COUNT", precision = 10, nullable = false)
  private Long revisionCount;

  @Column(name = "SYSTEM_TRAY_NO", precision = 5)
  private Integer systemTrayNo;

  @Column(name = "GERMINATOR_ID", length = 1)
  private String germinatorId;
}
