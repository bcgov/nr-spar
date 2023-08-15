package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository for {@link GeneticWorthEntity}. */
public interface GeneticWorthRepository extends JpaRepository<GeneticWorthEntity, String> {}
