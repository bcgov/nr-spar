package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.RequestVeglot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** This interface enables the RequestVeglot entity to be retrieved from the database. */
public interface RequestVeglotRepository extends JpaRepository<RequestVeglot, Long> {
  @Query("""
      SELECT CASE WHEN COUNT(rv) > 0 THEN true ELSE false END
      FROM RequestVeglot rv
      WHERE rv.requestSkey = :requestSkey
        AND rv.itemId = :itemId
        AND UPPER(rv.commitmentInd) = 'Y'
      """)
  boolean existsCommitmentYes(
      @Param("requestSkey") Long requestSkey,
      @Param("itemId") String itemId
  );
}
