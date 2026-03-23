package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.GerminationTrayContentsEntity;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository for germination tray contents view.
 */
public interface GerminationTrayContentsRepository
    extends JpaRepository<GerminationTrayContentsEntity, BigDecimal> {

  @Query("""
      SELECT gtc, a.updateTimestamp
      FROM GerminationTrayContentsEntity gtc
      LEFT JOIN ActivityEntity a ON a.riaKey = gtc.riaSkey
      WHERE gtc.germinatorTrayId = :trayId
      ORDER BY gtc.seedlotNumber, gtc.requestId
      """)
  List<Object[]> findByGerminatorTrayId(@Param("trayId") Integer trayId);
}
