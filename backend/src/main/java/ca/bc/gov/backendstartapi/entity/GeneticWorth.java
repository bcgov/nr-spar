package ca.bc.gov.backendstartapi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** This class represents a Genetic Worth object in the database. */
@Getter
@Setter
@Entity
@Table(name = "genetic_worth")
public class GeneticWorth {
  
  @Id
  @Column(name = "genetic_worth_code", length = 3)
  private String id;

  @Column(name = "genetic_worth_name", length = 30)
  private String description;

}
