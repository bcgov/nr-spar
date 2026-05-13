package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.DailyAbnormalEntity;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DailyAbnormalRepository extends JpaRepository<DailyAbnormalEntity, BigDecimal> {
  /**
   * Finds a DailyAbnormalEntity by its daily germ surrogate key.
   *
   * @param dailyGermSkey the daily germ surrogate key identifier
   * @return the DailyAbnormalEntity matching the given dailyGermSkey, or null if not found
   */
  @Query("""
      SELECT d FROM DailyAbnormalEntity d
      WHERE d.dailyGermSkey = :dailyGermSkey
      """)
  DailyAbnormalEntity findByDailyGermSkey(@Param("dailyGermSkey") BigDecimal dailyGermSkey);
}
