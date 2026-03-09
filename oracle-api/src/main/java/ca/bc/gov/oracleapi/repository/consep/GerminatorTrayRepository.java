package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.dto.consep.GerminatorTrayContentsDto;
import ca.bc.gov.oracleapi.entity.consep.GerminatorTrayEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * This interface enables the germinator tray entity from consep to be retrieved from the database.
 */
public interface GerminatorTrayRepository extends JpaRepository<GerminatorTrayEntity, Integer> {

  @Query("""
        SELECT germinator_tray_id,
          vegetation_st,
          activity_type_cd,
          actual_start_date,
          date_created,
          ria_skey,
          request_id,
          request_skey,
          item_id,
          request_type_st,
          seedlot_number --seedlot or family lot,
          soak_start_date,
          soak_end_date,
          seed_withdrawal_date,
          warm_strat_start_date,
          dryback_start_date,
          germinator_entry,
          strat_start_dt,
          germinator_id,
          stndrd_activity_id,
          test_category_cd
        FROM consep.cns58traycontents
        WHERE germinator_tray_id = :trayId
        ORDER BY seedlot_number,
                request_id
      """)
  List<GerminatorTrayContentsDto> findTestsByGerminatorTrayId(@Param("trayId") Integer trayId);
}
