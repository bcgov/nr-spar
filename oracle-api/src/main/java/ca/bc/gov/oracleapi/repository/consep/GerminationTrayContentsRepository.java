package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.GerminationTrayContentsEntity;
import java.util.List;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository for germination tray contents view.
 */
public interface GerminationTrayContentsRepository
    extends JpaRepository<GerminationTrayContentsEntity, BigDecimal> {

  @Query("""
      SELECT gtc
      FROM GerminationTrayContentsEntity gtc
      WHERE gtc.germinatorTrayId = :trayId
      ORDER BY gtc.seedlotNumber, gtc.requestId
      """)
  List<GerminationTrayContentsEntity> findByGerminatorTrayId(
    @Param("trayId") Integer trayId
  );
}
