package ca.bc.gov.oracleapi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import org.hibernate.type.YesNoConverter;

/**
 * Seed transfer limit row from Oracle TRANSFER_LIMIT. Used to derive Area of Use min/max for
 * B-class lots (legacy {@code SPR_SEEDLOT.apply_no_superior_prov_limits}).
 */
@Getter
@Setter
@Entity
@Immutable
@Table(name = "TRANSFER_LIMIT")
public class TransferLimitEntity {

  @Id
  @Column(name = "TRANSFER_LIMIT_SKEY")
  private Long transferLimitSkey;

  /** Null means the limit applies to every species. */
  @Column(name = "VEGETATION_CODE")
  private String vegetationCode;

  @Column(name = "GENETIC_CLASS_CODE")
  private String geneticClassCode;

  /** Set for B-class rows; null for A-class rows. */
  @Column(name = "SUPERIOR_PRVNC_IND")
  @Convert(converter = YesNoConverter.class)
  private Boolean superiorProvenance;

  @Column(name = "COAST_INTERIOR_CODE", nullable = false)
  private String coastInteriorCode;

  /** Null means the limit applies to every seed plan zone in the coast/interior area. */
  @Column(name = "SEED_PLAN_ZONE_CODE")
  private String seedPlanZoneCode;

  @Column(name = "SITE_MIN_LATDEG", nullable = false)
  private Integer siteMinLatDeg;

  @Column(name = "SITE_MAX_LATDEG")
  private Integer siteMaxLatDeg;

  @Column(name = "LIMIT_NORTH_LATDEG")
  private Integer limitNorthLatDeg;

  @Column(name = "LIMIT_NORTH_LATMNT")
  private Integer limitNorthLatMin;

  @Column(name = "LIMIT_SOUTH_LATDEG")
  private Integer limitSouthLatDeg;

  @Column(name = "LIMIT_SOUTH_LATMNT")
  private Integer limitSouthLatMin;

  @Column(name = "LIMIT_EAST_LONGDEG")
  private Integer limitEastLongDeg;

  @Column(name = "LIMIT_EAST_LONGMNT")
  private Integer limitEastLongMin;

  @Column(name = "LIMIT_WEST_LONGDEG")
  private Integer limitWestLongDeg;

  @Column(name = "LIMIT_WEST_LONGMNT")
  private Integer limitWestLongMin;

  @Column(name = "LIMIT_UP_ELEVATN")
  private Integer limitUpElevation;

  @Column(name = "LIMIT_DOWN_ELEVATN")
  private Integer limitDownElevation;

  @Column(name = "TRANSFER_RCMNDTN_DESC")
  private String transferRecommendation;

  @Column(name = "MAX_COLLECTION_ELEVATION_RANGE")
  private Integer maxCollectionElevationRange;
}
