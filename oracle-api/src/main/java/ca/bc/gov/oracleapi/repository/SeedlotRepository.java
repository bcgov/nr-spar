package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.Seedlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** This interface enables the funding source entity to be retrieved from the database. */
public interface SeedlotRepository extends JpaRepository<Seedlot, String> {

  @Query("SELECT s.ORIGINAL_SEED_QTY FROM SEEDLOT s WHERE s.SEEDLOT_NUMBER = :seedlotNumber")
  Seedlot findSeedlotBySeedlotNumber(@Param("seedlotNumber") Long seedlotNumber);
}
