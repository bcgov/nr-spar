package ca.bc.gov.backendstartapi.entity;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToOne;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class SaveSeedlotProgressEntityTest {

  @Test
  @DisplayName("Deleting a draft never cascades to its seedlot")
  void seedlotRelation_doesNotCascadeRemove() throws NoSuchFieldException {
    OneToOne relation =
        SaveSeedlotProgressEntity.class.getDeclaredField("seedlot").getAnnotation(OneToOne.class);
    List<CascadeType> cascade = List.of(relation.cascade());

    assertFalse(cascade.contains(CascadeType.REMOVE));
    assertFalse(cascade.contains(CascadeType.ALL));
    // Saving a draft still saves seedlot changes made alongside it (INC to PND, copy).
    assertTrue(cascade.containsAll(List.of(CascadeType.PERSIST, CascadeType.MERGE)));
  }
}
