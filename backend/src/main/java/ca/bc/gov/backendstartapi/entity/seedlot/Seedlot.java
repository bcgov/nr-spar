package ca.bc.gov.backendstartapi.entity.seedlot;

import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.entity.SeedlotStatusEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.AuditInformation;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import lombok.ToString;
import org.locationtech.jts.geom.Point;

/** A registered seedlot. */
@Entity
@Table(name = "seedlot")
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class Seedlot implements Serializable {
  @Id
  @Column(name = "seedlot_number", length = 5)
  @NonNull
  private String id;

  @JoinColumn(name = "seedlot_status_code", nullable = false)
  @ManyToOne(fetch = FetchType.LAZY)
  @NonNull
  private SeedlotStatusEntity seedlotStatus;

  @Column(name = "seedlot_comment", length = 2000)
  private String comment;

  // region Applicant
  @Column(name = "applicant_client_number", length = 8)
  private String applicantClientNumber;

  @Column(name = "applicant_locn_code", length = 2)
  private String applicantLocationCode;

  @Column(name = "applicant_email_address", length = 100)
  private String applicantEmailAddress;

  // endregion

  // region Lot information
  @Column(name = "vegetation_code", length = 8)
  private String vegetationCode;

  @JoinColumn(name = "genetic_class_code")
  @ManyToOne(fetch = FetchType.LAZY)
  private GeneticClassEntity geneticClass;

  @JoinColumn(name = "seedlot_source_code")
  @ManyToOne(fetch = FetchType.LAZY)
  private SeedlotSourceEntity seedlotSource;

  @Column(name = "to_be_registrd_ind")
  private Boolean intendedForCrownLand;

  @Column(name = "bc_source_ind")
  private Boolean sourceInBc;

  // endregion

  // region Collection
  @Column(name = "collection_client_number", length = 8)
  private String collectionClientNumber;

  @Column(name = "collection_locn_code", length = 2)
  private String collectionLocationCode;

  @Column(name = "collection_start_date")
  private LocalDate collectionStartDate;

  @Column(name = "collection_end_date")
  private LocalDate collectionEndDate;

  @Column(name = "no_of_containers", precision = 6, scale = 2)
  private BigDecimal numberOfContainers;

  @Column(name = "vol_per_container", precision = 6, scale = 2)
  private BigDecimal containerVolume;

  /**
   * Usually, but not necessarily, the product of {@link #numberOfContainers} and {@link
   * #containerVolume}.
   */
  @Column(name = "clctn_volume", precision = 6, scale = 2)
  private BigDecimal totalConeVolume;

  // endregion

  // region Interim storage
  @Column(name = "interm_strg_client_number", length = 8)
  private String interimStorageClientNumber;

  @Column(name = "interm_strg_locn_code", length = 2)
  private String interimStorageLocationCode;

  @Column(name = "interm_strg_st_date")
  private LocalDate interimStorageStartDate;

  @Column(name = "interm_strg_end_date")
  private LocalDate interimStorageEndDate;

  @Column(name = "interm_facility_code", length = 3)
  private String interimStorageFacilityCode;

  @Column(name = "interm_strg_locn", length = 55)
  private String interimStorageOtherFacilityDesc;

  // endregion

  // region Orchard
  @Column(name = "female_gametic_mthd_code", length = 4)
  private String femaleGameticContributionMethod;

  @Column(name = "male_gametic_mthd_code", length = 4)
  private String maleGameticContributionMethod;

  @Column(name = "controlled_cross_ind")
  private Boolean producedThroughControlledCross;

  @Column(name = "biotech_processes_ind")
  private Boolean producedWithBiotechnologicalProcesses;

  @Column(name = "pollen_contamination_ind")
  private Boolean pollenContaminationPresentInOrchard;

  @Column(name = "pollen_contamination_pct")
  private Integer pollenContaminationPercentage;

  @Column(name = "contaminant_pollen_bv", precision = 4, scale = 1)
  private BigDecimal pollenContaminantBreedingValue;

  @Column(name = "pollen_contamination_mthd_code", length = 4)
  private String pollenContaminationMethodCode;

  @Column(name = "coancestry", precision = 20, scale = 10)
  private String coancestry;

  // endregion

  // region Parent tree & SMP
  @Column(name = "total_parent_trees")
  private Integer totalParentTrees;

  // SMP: Supplemental mass pollination.
  @Column(name = "smp_success_pct")
  private Integer smpSuccessPercentage;

  @Column(name = "effective_pop_size", precision = 5, scale = 1)
  private BigDecimal effectivePopulationSize;

  @Column(name = "smp_parents_outside")
  private Integer parentsOutsideTheOrchardUsedInSmp;

  @Column(name = "non_orchard_pollen_contam_pct")
  private Integer nonOrchardPollenContaminationPercentage;

  // endregion

  // region Extraction & Storage
  @Column(name = "extractory_client_number", length = 8)
  private String extractionClientNumber;

  @Column(name = "extractory_locn_code", length = 2)
  private String extractionLocationCode;

  @Column(name = "extraction_st_date")
  private LocalDate extractionStartDate;

  @Column(name = "extraction_end_date")
  private LocalDate extractionEndDate;

  @Column(name = "temporary_strg_client_number", length = 8)
  private String storageClientNumber;

  @Column(name = "temporary_strg_locn_code", length = 2)
  private String storageLocationCode;

  @Column(name = "temporary_strg_start_date")
  private LocalDate temporaryStorageStartDate;

  @Column(name = "temporary_strg_end_date")
  private LocalDate temporaryStorageEndDate;

  // endregion

  // region Legal & Audit
  // "I hereby declare that the information provided is true and correct..."
  @Column(name = "declared_userid", length = 30)
  private String declarationOfTrueInformationUserId;

  @Column(name = "declared_timestamp")
  private LocalDateTime declarationOfTrueInformationTimestamp;

  @Embedded private AuditInformation auditInformation;

  @Column(name = "revision_count", nullable = false)
  @Version
  @Setter(AccessLevel.NONE)
  private int revisionCount;

  // endregion

  // geographic data

  @Column(name = "seed_plan_unit_id")
  private Integer seedPlanUnitId;

  @Column(name = "bgc_zone_code", length = 4)
  private String bgcZoneCode;

  @Column(name = "bgc_zone_description", length = 120)
  private String bgcZoneDescription;

  @Column(name = "bgc_subzone_code", length = 3)
  private String bgcSubzoneCode;

  @Column(name = "variant")
  private Character variant;

  @Column(name = "bec_version_id")
  private Integer becVersionId;

  @Column(name = "elevation")
  private Integer elevation;

  @Column(name = "latitude_degrees")
  private Integer latitudeDegrees;

  @Column(name = "latitude_minutes")
  private Integer latitudeMinutes;

  @Column(name = "latitude_seconds")
  private Integer latitudeSeconds;

  @Column(name = "longitude_degrees")
  private Integer longitudeDegrees;

  @Column(name = "longitude_minutes")
  private Integer longitudeMinutes;

  @Column(name = "longitude_seconds")
  private Integer longitudeSeconds;

  @Column(name = "collection_elevation")
  private Integer collectionElevation;

  @Column(name = "collection_elevation_min")
  private Integer collectionElevationMin;

  @Column(name = "collection_elevation_max")
  private Integer collectionElevationMax;

  @Column(name = "collection_latitude_deg")
  private Integer collectionLatitudeDeg;

  @Column(name = "collection_latitude_min")
  private Integer collectionLatitudeMin;

  @Column(name = "collection_latitude_sec")
  private Integer collectionLatitudeSec;

  @Column(name = "collection_latitude_code")
  private Character collectionLatitudeCode;

  @Column(name = "collection_longitude_deg")
  private Integer collectionLongitudeDeg;

  @Column(name = "collection_longitude_min")
  private Integer collectionLongitudeMin;

  @Column(name = "collection_longitude_sec")
  private Integer collectionLongitudeSec;

  @Column(name = "collection_longitude_code")
  private Character collectionLongitudeCode;

  @Column(name = "elevation_min")
  private Integer elevationMin;

  @Column(name = "elevation_max")
  private Integer elevationMax;

  @Column(name = "latitude_deg_min")
  private Integer latitudeDegMin;

  @Column(name = "latitude_min_min")
  private Integer latitudeMinMin;

  @Column(name = "latitude_sec_min")
  private Integer latitudeSecMin;

  @Column(name = "latitude_deg_max")
  private Integer latitudeDegMax;

  @Column(name = "latitude_min_max")
  private Integer latitudeMinMax;

  @Column(name = "latitude_sec_max")
  private Integer latitudeSecMax;

  @Column(name = "longitude_deg_min")
  private Integer longitudeDegMin;

  @Column(name = "longitude_min_min")
  private Integer longitudeMinMin;

  @Column(name = "longitude_sec_min")
  private Integer longitudeSecMin;

  @Column(name = "longitude_deg_max")
  private Integer longitudeDegMax;

  @Column(name = "longitude_min_max")
  private Integer longitudeMinMax;

  @Column(name = "longitude_sec_max")
  private Integer longitudeSecMax;

  @Column(name = "smp_mean_bv_growth", precision = 4, scale = 1)
  private BigDecimal smpMeanBvGrowth;

  @Column(name = "area_of_use_comment", length = 2000)
  private String areaOfUseComment;

  @Column(name = "approved_userid")
  private String approvedUserId;

  @Column(name = "approved_timestamp")
  private LocalDateTime approvedTimestamp;

  @Column(name = "mean_geom")
  private Point meanGeom;

  // end geographic

  public Seedlot(String id) {
    this.id = id;
  }
}
