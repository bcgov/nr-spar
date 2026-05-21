package ca.bc.gov.oracleapi.repository.consep;

import ca.bc.gov.oracleapi.entity.consep.GermCountEntity;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for daily germination count data in consep.cns_t_germ_count.
 */
public interface GermCountRepository extends JpaRepository<GermCountEntity, BigDecimal> {
}
