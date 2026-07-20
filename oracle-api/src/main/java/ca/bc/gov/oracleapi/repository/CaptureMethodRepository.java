package ca.bc.gov.oracleapi.repository;

import ca.bc.gov.oracleapi.dto.CodeDescriptionDto;
import ca.bc.gov.oracleapi.entity.CaptureMethodCodeEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** This interface enables the capture method entity to be retrieved from the database. */
public interface CaptureMethodRepository extends JpaRepository<CaptureMethodCodeEntity, String> {

  @Query(
      """
      SELECT new ca.bc.gov.oracleapi.dto.CodeDescriptionDto(
        cm.code, cm.description, cm.effectiveDate, cm.expiryDate)
      FROM CaptureMethodCodeEntity cm
      WHERE CURRENT_DATE >= cm.effectiveDate AND CURRENT_DATE < cm.expiryDate
      ORDER BY cm.code
      """)
  List<CodeDescriptionDto> findAllValid();
}
