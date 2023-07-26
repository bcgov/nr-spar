package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.GeneticWorth;
import org.springframework.data.jpa.repository.JpaRepository;

/** This class represents the database repository for a {@link GeneticWorth}. */
public interface GeneticWorthRepository extends JpaRepository<GeneticWorth, String> {}
