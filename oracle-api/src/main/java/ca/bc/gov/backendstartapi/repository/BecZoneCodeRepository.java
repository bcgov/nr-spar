package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.BecZoneCodeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/** This interface enables the BEC Zone Code entity to be retrieved from the database. */
public interface BecZoneCodeRepository extends JpaRepository<BecZoneCodeEntity, String> {}
