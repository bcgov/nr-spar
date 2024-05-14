package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.SmpMix;
import ca.bc.gov.backendstartapi.entity.idclass.SmpMixId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository for {@link SmpMix SMPMixes}. */
public interface SmpMixRepository extends JpaRepository<SmpMix, SmpMixId> {

  List<SmpMix> findAllBySeedlot_id(String seedlotNumber);
}
