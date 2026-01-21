package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.RequestSeedlot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** This interface enables the RequestSeedlot entity to be retrieved from the database. */
public interface RequestSeedlotRepository extends JpaRepository<RequestSeedlot, Long> {
  @Query("""
      SELECT rs.commitmentInd
      FROM RequestSeedlot rs
      WHERE rs.requestSkey = :requestSkey
      AND rs.itemId = :itemId
      """)
  String getCommitment(@Param("requestSkey") Long requestSkey, @Param("itemId") String itemId);
}
