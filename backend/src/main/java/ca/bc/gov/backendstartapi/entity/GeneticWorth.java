package ca.bc.gov.backendstartapi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "genetic_worth")
public class GeneticWorth {
  
  @Id
  @Column(name = "genetic_worth_code")
  private String id;

  @Column(name = "genetic_worth_name")
  private String description;

}
