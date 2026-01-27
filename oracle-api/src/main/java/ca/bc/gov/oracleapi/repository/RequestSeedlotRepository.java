package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.RequestSeedlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** This interface enables the RequestSeedlot entity to be retrieved from the database. */
public interface RequestSeedlotRepository extends JpaRepository<RequestSeedlot, Long> {
  @Query("""
      SELECT CASE WHEN COUNT(rs) > 0 THEN true ELSE false END
      FROM RequestSeedlot rs
      WHERE rs.requestSkey = :requestSkey
        AND rs.itemId = :itemId
        AND UPPER(rs.commitmentInd) = 'Y'
      """)
  boolean existsCommitmentYes(
      @Param("requestSkey") Long requestSkey,
      @Param("itemId") String itemId
  );
}
