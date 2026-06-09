package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.dto.SeedlotSpeciesDto;
import ca.bc.gov.oracleapi.entity.RequestSeedlot;
import java.util.List;
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

  /**
   * Find the seedlot number and species (vegetation code) mapped to a request key, by joining the
   * request seedlot with its spar request. The request key to seedlot relationship is one-to-one.
   *
   * @param requestKey the request key (request skey) to look up
   * @return a list with at most one {@link SeedlotSpeciesDto}; empty when the key does not exist
   */
  @Query("""
      SELECT new ca.bc.gov.oracleapi.dto.SeedlotSpeciesDto(rs.seedlotNumber, sr.vegetationCode)
      FROM RequestSeedlot rs, SparRequest sr
      WHERE rs.requestSkey = sr.requestSkey
        AND rs.requestSkey = :requestKey
      """)
  List<SeedlotSpeciesDto> findSeedlotAndSpeciesByRequestKey(
      @Param("requestKey") Long requestKey);
}
