package ca.bc.gov.backendstartapi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import ca.bc.gov.backendstartapi.entity.GeneticWorth;

public interface GeneticWorthRepository extends JpaRepository<GeneticWorth, String> {
  
}
