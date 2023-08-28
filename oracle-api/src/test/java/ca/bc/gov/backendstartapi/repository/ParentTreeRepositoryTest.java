package ca.bc.gov.backendstartapi.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.entity.ParentTreeEntity;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.jdbc.Sql;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
class ParentTreeRepositoryTest {

  @Autowired private ParentTreeRepository parentTreeRepository;

  @Test
  @DisplayName("findAllInTest")
  @Sql(scripts = {"classpath:scripts/ParentTreeRepository.sql"})
  void findAllInTest() {
    List<ParentTreeEntity> parentTreeList = parentTreeRepository.findAllIn(List.of(4032L, 4033L));

    assertFalse(parentTreeList.isEmpty());
    assertEquals(2, parentTreeList.size());

    ParentTreeEntity parentTree = parentTreeList.get(0);
    assertEquals(4032L, parentTree.getId());
    assertEquals("37", parentTree.getParentTreeNumber());
    assertEquals("AT", parentTree.getVegetationCode());
    assertEquals("APP", parentTree.getParentTreeRegStatusCode());
    assertEquals("111", parentTree.getLocalNumber());
    assertTrue(parentTree.getActive());
    assertTrue(parentTree.getTested());
    assertTrue(parentTree.getBreedingProgram());
    assertNull(parentTree.getFemaleParentTreeId());
    assertNull(parentTree.getMaleParentTreeId());

    ParentTreeEntity parentTree2 = parentTreeList.get(1);
    assertEquals(4033L, parentTree2.getId());
    assertEquals("38", parentTree2.getParentTreeNumber());
    assertEquals("AC", parentTree2.getVegetationCode());
    assertEquals("APP", parentTree2.getParentTreeRegStatusCode());
    assertEquals("112", parentTree2.getLocalNumber());
    assertFalse(parentTree2.getActive());
    assertFalse(parentTree2.getTested());
    assertFalse(parentTree2.getBreedingProgram());
    assertEquals(10001L, parentTree2.getFemaleParentTreeId());
    assertEquals(10002L, parentTree2.getMaleParentTreeId());
  }
}
