package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.GermCountEntity;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

/** Repository for daily germination count data in consep.cns_t_germ_count. */
public interface GermCountRepository extends JpaRepository<GermCountEntity, BigDecimal> {
  /**
   * Optimistic-lock guard for updates: bumps update_timestamp only if it still matches
   * the value the caller read. Returns 0 when the row changed since (caller throws 409).
   */
  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Transactional
  @Query("""
      UPDATE GermCountEntity g
         SET g.updateTimestamp = CURRENT_TIMESTAMP
       WHERE g.riaSkey = :riaSkey
         AND g.updateTimestamp = :updateTimestamp
      """)
  int touchIfTimestampMatches(
      @Param("riaSkey") BigDecimal riaSkey,
      @Param("updateTimestamp") LocalDateTime updateTimestamp);

  /**
   * Next surrogate key for a daily germ slot / abnormal row (Oracle sequence).
   */
  @Query(value = "SELECT CONSEP.CNS_SEQ_COUNTER.NEXTVAL FROM DUAL", nativeQuery = true)
  BigDecimal nextDailyGermSkey();

  @Query(
      value =
          """
          SELECT *
            FROM CONSEP.CNS_T_GERM_COUNT gc
           WHERE :dailyGermSkey IN (
             gc.DAILY_GERM_SKEY1, gc.DAILY_GERM_SKEY2, gc.DAILY_GERM_SKEY3,
             gc.DAILY_GERM_SKEY4, gc.DAILY_GERM_SKEY5, gc.DAILY_GERM_SKEY6,
             gc.DAILY_GERM_SKEY7, gc.DAILY_GERM_SKEY8, gc.DAILY_GERM_SKEY9,
             gc.DAILY_GERM_SKEY10, gc.DAILY_GERM_SKEY11, gc.DAILY_GERM_SKEY12,
             gc.DAILY_GERM_SKEY13
           )
          """,
      nativeQuery = true)
  java.util.Optional<GermCountEntity> findByDailyGermSkeyInAnySlot(
      @Param("dailyGermSkey") BigDecimal dailyGermSkey);
}
