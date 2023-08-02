package ca.bc.gov.backendstartapi.service;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.entity.GeneticClassEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.repository.GeneticClassRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class GeneticClassServiceTest {

  @Mock GeneticClassRepository geneticClassRepository;
  private GeneticClassService geneticClassService;

  @BeforeEach
  void setup() {
    geneticClassService = new GeneticClassService(geneticClassRepository);
  }

  @Test
  @DisplayName("getAllGeneticClassTest")
  void getAllGeneticClassTest() {
    CodeDescriptionDto firstMethod = new CodeDescriptionDto("A", "Orchard Seed or Cuttings");
    CodeDescriptionDto secondMethod = new CodeDescriptionDto("B", "Natural Stand Seed or Cuttings");

    List<CodeDescriptionDto> testDtoList =
        new ArrayList<>() {
          {
            add(firstMethod);
            add(secondMethod);
          }
        };

    LocalDate now = LocalDate.now();
    var effectiveDate = now.minusDays(2);
    var nonExpiryDate = now.plusDays(2);
    var expiredDate = now.minusDays(1);
    var effectiveDateRange = new EffectiveDateRange(effectiveDate, nonExpiryDate);
    var expiredDateRange = new EffectiveDateRange(effectiveDate, expiredDate);

    GeneticClassEntity firstEntity =
        new GeneticClassEntity("A", "Orchard Seed or Cuttings", effectiveDateRange);
    geneticClassRepository.saveAndFlush(firstEntity);
    GeneticClassEntity secondEntity =
        new GeneticClassEntity("B", "Natural Stand Seed or Cuttings", effectiveDateRange);
    geneticClassRepository.saveAndFlush(secondEntity);
    // This entity should not appear in the result list
    GeneticClassEntity expiredEntity =
        new GeneticClassEntity("V", "V for Vendetta", expiredDateRange);
    geneticClassRepository.saveAndFlush(expiredEntity);

    List<GeneticClassEntity> testEntityList =
        new ArrayList<>() {
          {
            add(firstEntity);
            add(secondEntity);
            add(expiredEntity);
          }
        };

    when(geneticClassRepository.findAll()).thenReturn(testEntityList);

    List<CodeDescriptionDto> resultList = geneticClassService.getAllGeneticClass();

    Assertions.assertEquals(testEntityList.size() - 1, resultList.size());
    Assertions.assertEquals(testDtoList.size(), resultList.size());
    Assertions.assertEquals(testDtoList.get(0).code(), resultList.get(0).code());
    Assertions.assertEquals(testDtoList.get(0).description(), resultList.get(0).description());
    Assertions.assertEquals(testDtoList.get(1).code(), resultList.get(1).code());
    Assertions.assertEquals(testDtoList.get(1).description(), resultList.get(1).description());
  }

  @Test
  @DisplayName("getGeneticClassByCodeTest")
  void getGeneticClassByCodeTest() {
    var testCode = "A";
    CodeDescriptionDto testDto = new CodeDescriptionDto(testCode, "Orchard Seed or Cuttings");

    LocalDate now = LocalDate.now();
    var effectiveDate = now.minusDays(2);
    var nonExpiryDate = now.plusDays(2);
    var effectiveDateRange = new EffectiveDateRange(effectiveDate, nonExpiryDate);

    GeneticClassEntity testEntity =
        new GeneticClassEntity(testCode, "Orchard Seed or Cuttings", effectiveDateRange);
    geneticClassRepository.saveAndFlush(testEntity);

    when(geneticClassRepository.findById(testCode)).thenReturn(Optional.of(testEntity));

    CodeDescriptionDto resultDto = geneticClassService.getGeneticClassByCode(testCode);

    Assertions.assertEquals(testDto.code(), resultDto.code());
    Assertions.assertEquals(testDto.description(), resultDto.description());
  }
}
