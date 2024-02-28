package ca.bc.gov.backendstartapi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** This class represents a Parent Tree of an {@link Orchard} in the database. */
@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "PARENT_TREE")
public class ParentTreeEntity {

  @Id
  @Column(name = "PARENT_TREE_ID")
  private Long id;

  @Column(name = "PARENT_TREE_NUMBER", length = 5, nullable = false)
  private String parentTreeNumber;

  @Column(name = "VEGETATION_CODE", length = 8, nullable = false)
  private String vegetationCode;

  @Column(name = "PARENT_TREE_REG_STATUS_CODE", length = 3, nullable = false)
  private String parentTreeRegStatusCode;

  @Column(name = "LOCAL_NUMBER", length = 20)
  private String localNumber;

  @Column(name = "ACTIVE_IND")
  private Boolean active;

  @Column(name = "TESTED_IND")
  private Boolean tested;

  @Column(name = "BREEDING_PROGRAM_IND")
  private Boolean breedingProgram;

  @Column(name = "FEMALE_PARENT_PARENT_TREE_ID")
  private Long femaleParentTreeId;

  @Column(name = "MALE_PARENT_PARENT_TREE_ID")
  private Long maleParentTreeId;

  @Column(name = "LATITUDE_DEGREES")
  private Integer latitudeDegrees;

  @Column(name = "LATITUDE_MINUTES")
  private Integer latitudeMinutes;

  @Column(name = "LATITUDE_SECONDS")
  private Integer latitudeSeconds;

  @Column(name = "LONGITUDE_DEGREES")
  private Integer longitudeDegrees;

  @Column(name = "LONGITUDE_MINUTES")
  private Integer longitudeMinutes;

  @Column(name = "LONGITUDE_SECONDS")
  private Integer longitudeSeconds;

  @Column(name = "ELEVATION")
  private Integer elevation;
}
