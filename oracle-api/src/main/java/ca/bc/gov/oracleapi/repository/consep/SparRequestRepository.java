package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.SparRequestEntity;
import ca.bc.gov.oracleapi.entity.projection.RequestSeedlotProj;
import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * This interface enables the spar request entity from consep to be retrieved from the database.
 */
public interface SparRequestRepository extends JpaRepository<SparRequestEntity, BigDecimal> {
  @Query("SELECT s.requestTypeSt FROM SparRequestEntity s WHERE s.requestSkey = :requestSkey")
  String findRequestTypeStByRequestSkey(@Param("requestSkey") BigDecimal requestSkey);

  /**
   * Resolves a seedlot number and a request item (aka request ID) to the request-seedlot row they
   * identify, for the Copy Results screen.
   *
   * <p>The request item is not a stored column: an SRQ request spells it as the sowing year, the
   * first three characters of the org unit code and a four-digit sequence; everything else spells
   * it as the request type, the request year, a four-digit sequence and then the item id. Both are
   * assembled here so the caller can match on what the user actually types.
   *
   * <p>Filtering on the assembled value means it cannot be indexed, but the seedlot number can and
   * is, which narrows the scan to one seedlot's requests before the CASE is evaluated.
   */
  @Query(nativeQuery = true, value = """
      SELECT CASE r.REQUEST_TYPE_ST
               WHEN 'SRQ' THEN
                 SUBSTR(TO_CHAR(r.SOWING_YR)
                     || SUBSTR(o.ORG_UNIT_CODE, 1, 3)
                     || LPAD(TO_CHAR(r.REQUEST_SEQUENCE), 4, '0'), 1, 12)
               ELSE
                 SUBSTR(r.REQUEST_TYPE_ST
                     || TO_CHAR(r.REQUEST_YR)
                     || LPAD(TO_CHAR(r.REQUEST_SEQUENCE), 4, '0'), 1, 11)
                     || rs.ITEM_ID
             END               AS REQUEST_ITEM
           , rs.REQUEST_SKEY   AS REQUEST_SKEY
           , rs.ITEM_ID        AS ITEM_ID
           , s.SEEDLOT_NUMBER  AS SEEDLOT_NUMBER
           , s.VEGETATION_ST   AS VEGETATION_ST
        FROM CONSEP.CNS_T_SPAR_REQUEST r
        LEFT JOIN CONSEP.CNS_T_ORG_UNIT o
          ON o.ORG_UNIT_NO = r.ORG_UNIT_NO
        JOIN CONSEP.CNS_T_REQUEST_SEEDLOT rs
          ON rs.REQUEST_SKEY = r.REQUEST_SKEY
        JOIN CONSEP.CNS_T_SEEDLOT s
          ON s.SEEDLOT_NUMBER = rs.SEEDLOT_NUMBER
       WHERE rs.SEEDLOT_NUMBER = :seedlotNumber
         AND CASE r.REQUEST_TYPE_ST
               WHEN 'SRQ' THEN
                 SUBSTR(TO_CHAR(r.SOWING_YR)
                     || SUBSTR(o.ORG_UNIT_CODE, 1, 3)
                     || LPAD(TO_CHAR(r.REQUEST_SEQUENCE), 4, '0'), 1, 12)
               ELSE
                 SUBSTR(r.REQUEST_TYPE_ST
                     || TO_CHAR(r.REQUEST_YR)
                     || LPAD(TO_CHAR(r.REQUEST_SEQUENCE), 4, '0'), 1, 11)
                     || rs.ITEM_ID
             END = :requestId
      """)
  Optional<RequestSeedlotProj> findBySeedlotNumberAndRequestId(
      @Param("seedlotNumber") String seedlotNumber,
      @Param("requestId") String requestId);
}
