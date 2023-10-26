package ca.bc.gov.backendstartapi.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import ca.bc.gov.backendstartapi.entity.VegetationCode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.jdbc.Sql;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@Sql(scripts = {"classpath:scripts/vegetationCodes.sql"})
class VegetationCodeRepositoryTest {

  @Autowired private VegetationCodeRepository vegetationCodeRepository;

  @Test
  void findById_valid() {
    var vc1 = vegetationCodeRepository.findById("VC1");
    assertTrue(vc1.isPresent());

    var vc = vc1.get();
    assertEquals("VC1", vc.getId());
    assertEquals("Vegetation code 1", vc.getDescription());
    assertTrue(vc.isValid());
  }

  @Test
  void findById_invalid() {
    var vc2 = vegetationCodeRepository.findById("VC2");
    assertTrue(vc2.isPresent());

    var vc = vc2.get();
    assertEquals("VC2", vc.getId());
    assertEquals("Vegetation code 2", vc.getDescription());
    assertFalse(vc.isValid());
  }

  @Test
  void findById_inexistent() {
    var vc0 = vegetationCodeRepository.findById("VC0");
    assertTrue(vc0.isEmpty());
  }

  @Test
  void searchValid_match() {
    Pageable pageable = PageRequest.of(0, 20);
    var resultsPage = vegetationCodeRepository.findByCodeOrDescription("%vc%", pageable);
    var results = resultsPage.toList();
    assertEquals(3, results.size());

    assertTrue(results.stream().allMatch(VegetationCode::isValid), "All results must be valid.");

    assertEquals(
        results.stream()
            .sorted((vc1, vc2) -> CharSequence.compare(vc1.getId(), vc2.getId()))
            .toList(),
        results,
        "Results must be sorted by code.");

    var vc1 = results.get(0);

    assertEquals("VC1", vc1.getId());
    assertEquals("Vegetation code 1", vc1.getDescription());

    var vc3 = results.get(1);

    assertEquals("VC3", vc3.getId());
    assertEquals("Vegetation code 3", vc3.getDescription());

    var vc4 = results.get(2);

    assertEquals("VC4", vc4.getId());
    assertEquals("Vegetation code 4", vc4.getDescription());

    assertEquals(
        results.stream()
            .sorted((vc1Sort, vc2Sort) -> CharSequence.compare(vc1Sort.getId(), vc2Sort.getId()))
            .toList(),
        results,
        "Results must be sorted by code.");
  }

  @Test
  void searchValid_pagination() {
    Pageable pageable = PageRequest.of(1, 2);
    var resultsPage = vegetationCodeRepository.findByCodeOrDescription("%vc%", pageable);
    var results = resultsPage.toList();
    assertEquals(1, results.size());

    assertTrue(results.stream().allMatch(VegetationCode::isValid), "All results must be valid.");

    var vc4 = results.get(0);

    assertEquals("VC4", vc4.getId());
    assertEquals("Vegetation code 4", vc4.getDescription());
  }

  @Test
  void searchValid_noMatch() {
    Pageable pageable = PageRequest.of(0, 20);
    var results = vegetationCodeRepository.findByCodeOrDescription("not vc", pageable);
    assertEquals(0, results.toList().size());
  }
}
