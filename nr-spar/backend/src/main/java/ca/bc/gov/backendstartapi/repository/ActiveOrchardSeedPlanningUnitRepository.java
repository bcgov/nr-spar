package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.ActiveOrchardSpuEntity;
import ca.bc.gov.backendstartapi.entity.idclass.ActiveOrchardSeedPlanningUnitId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** The repository for {@link ActiveOrchardSpuEntity ActiveOrchardSeedPlanningUnits}. */
public interface ActiveOrchardSeedPlanningUnitRepository
    extends JpaRepository<ActiveOrchardSpuEntity, ActiveOrchardSeedPlanningUnitId> {

  List<ActiveOrchardSpuEntity> findAllByActive(boolean active);

  List<ActiveOrchardSpuEntity> findByOrchardIdAndActive(String orchardId, boolean active);
}
