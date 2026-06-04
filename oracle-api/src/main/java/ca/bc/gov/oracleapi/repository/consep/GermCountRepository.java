package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.GermCountEntity;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Repository for daily germination count data in consep.cns_t_germ_count. */
public interface GermCountRepository extends JpaRepository<GermCountEntity, BigDecimal> {
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
