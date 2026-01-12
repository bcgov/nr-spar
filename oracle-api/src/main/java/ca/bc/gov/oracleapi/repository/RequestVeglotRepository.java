package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.entity.RequestVeglot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** This interface enables the funding source entity to be retrieved from the database. */
public interface RequestVeglotRepository extends JpaRepository<RequestVeglot, Long> {
  @Query("""
      SELECT rs.commitmentInd
      FROM RequestVeglot rs
      WHERE rs.requestSkey = :requestSkey
      AND rs.itemId = :itemId
      """)
  String getCommitment(@Param("requestSkey") Long requestSkey, @Param("itemId") String itemId);
}
