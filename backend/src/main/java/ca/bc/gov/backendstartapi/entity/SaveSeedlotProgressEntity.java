package ca.bc.gov.backendstartapi.entity;

import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.util.Map;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Wizard draft progress for an in-flight seedlot registration (A-class or B-class). */
@Entity
@Table(name = "seedlot_registration_save", schema = "spar")
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@Getter
@Setter
public class SaveSeedlotProgressEntity {

  @Id
  @Column(name = "seedlot_number")
  private String seedlotNumber;

  @OneToOne(cascade = CascadeType.ALL)
  @PrimaryKeyJoinColumn(name = "seedlot_number", referencedColumnName = "seedlotNumber")
  private Seedlot seedlot;

  @Column(name = "all_step_data", columnDefinition = "jsonb")
  @JdbcTypeCode(SqlTypes.JSON)
  private Map<String, Object> allStepData;

  @Column(name = "progress_status", columnDefinition = "jsonb")
  @JdbcTypeCode(SqlTypes.JSON)
  private Map<String, Object> progressStatus;

  @Embedded @NonNull private AuditInformation auditInformation;

  @Column(name = "revision_count", nullable = false)
  @Version
  @Setter(AccessLevel.NONE)
  private int revisionCount;

  /** Full constructor used when creating a new draft record. */
  public SaveSeedlotProgressEntity(
      Seedlot seedlot,
      Map<String, Object> allStepData,
      Map<String, Object> progressStatus,
      AuditInformation auditInformation) {
    this.seedlotNumber = seedlot.getId();
    this.seedlot = seedlot;
    this.allStepData = allStepData;
    this.progressStatus = progressStatus;
    this.auditInformation = auditInformation;
  }
}
