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
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import net.minidev.json.JSONObject;

/** Quantification of a given genetic quality in a seedlot. */
@Entity
@Table(name = "seedlot_registration_a_class_save")
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@Getter
@Setter
public class SeedlotAClassSaveEntity {
  @Id
  @Column(name = "seedlot_number")
  private String seedlotNumber;

  @OneToOne(cascade = CascadeType.ALL)
  @PrimaryKeyJoinColumn(name = "seedlot_number", referencedColumnName = "seedlotNumber")
  private Seedlot seedlot;

  @Column(name = "all_step_data", columnDefinition = "jsonb")
  private JSONObject allStepData;

  @Column(name = "progress_status", columnDefinition = "jsonb")
  private JSONObject progressStatus;

  @Embedded @NonNull private AuditInformation auditInformation;

  @Column(name = "revision_count", nullable = false)
  @Version
  @Setter(AccessLevel.NONE)
  private int revisionCount;

  public SeedlotAClassSaveEntity(
      Seedlot seedlot,
      JSONObject allStepData,
      JSONObject progressStatus,
      AuditInformation auditInformation,
      int revisionCount) {
    this.seedlotNumber = seedlot.getId();
    this.seedlot = seedlot;
    this.allStepData = allStepData;
    this.progressStatus = progressStatus;
    this.auditInformation = auditInformation;
    this.revisionCount = revisionCount;
  }
}
