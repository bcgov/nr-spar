package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository for {@link GeneticClassEntity}. */
public interface GeneticClassRepository extends JpaRepository<GeneticClassEntity, String> {}
