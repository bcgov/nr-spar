package ca.bc.gov.backendstartapi.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.extension.AbstractTestContainerIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.jdbc.Sql;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@DisplayName("Repository Test | ActiveOrchardSeedPlanningUnit")
class ActiveOrchardSeedPlanningUnitRepositoryTest extends AbstractTestContainerIntegrationTest {

  @Autowired
  private ActiveOrchardSeedPlanningUnitRepository activeOrchardSeedPlanningUnitRepository;

  @Test
  @DisplayName("testFindByOrchardIdAndActive")
  void testFindByOrchardIdAndActive() {
    var actives = activeOrchardSeedPlanningUnitRepository.findByOrchardIdAndActive("144", true);
    assertEquals(1, actives.size());

    var active = actives.get(0);
    assertEquals("144", active.getOrchardId());
    assertEquals(108, active.getSeedPlanningUnitId());
    assertTrue(active.isActive());
    assertFalse(active.isRetired());
    assertFalse(active.isSpuNotAssigned());

    var inactives = activeOrchardSeedPlanningUnitRepository.findByOrchardIdAndActive("101", false);
    assertEquals(1, inactives.size());

    var inactive = inactives.get(0);
    assertEquals("101", inactive.getOrchardId());
    assertEquals(7, inactive.getSeedPlanningUnitId());
    assertFalse(inactive.isActive());
    assertTrue(inactive.isRetired());
    assertFalse(inactive.isSpuNotAssigned());
  }
}
