package ca.bc.gov.oracleapi.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * This class represents an Orchard. A location where class A seed or class A cuttings are produced.
 */
@Getter
@Setter
@Entity
@Table(name = "ORCHARD")
public class OrchardEntity {

  @Id
  @Column(name = "ORCHARD_ID", length = 3)
  private String id;

  @Column(name = "ORCHARD_NAME", length = 30)
  private String name;

  @Column(name = "VEGETATION_CODE", length = 8)
  private String vegetationCode;

  @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  @JoinColumn(name = "ORCHARD_LOT_TYPE_CODE", referencedColumnName = "ORCHARD_LOT_TYPE_CODE", updatable = false)
  private OrchardLotTypeCode orchardLotTypeCode;

  @Column(name = "ORCHARD_STAGE_CODE", length = 3)
  private String stageCode;

  @Column(name = "BEC_ZONE", length = 4)
  private String becZoneCode;

  @Column(name = "BEC_SUBZONE", length = 3)
  private String becSubzoneCode;

  @Column(name = "VARIANT", length = 1)
  private Character variant;

  @Column(name = "BEC_VERSION_ID")
  private Integer becVersionId;
}
