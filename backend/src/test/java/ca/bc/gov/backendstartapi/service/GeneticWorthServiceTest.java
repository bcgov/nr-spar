package ca.bc.gov.backendstartapi.service;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
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
class GeneticWorthServiceTest {

  @Mock GeneticWorthRepository geneticWorthRepository;
  private GeneticWorthService geneticWorthService;

  @BeforeEach
  void setup() {
    geneticWorthService = new GeneticWorthService(geneticWorthRepository);
  }

  @Test
  @DisplayName("getAllGeneticWorthServiceTest")
  void getAllGeneticWorthServiceTest() {
    LocalDate now = LocalDate.now();
    var effectiveDate = now.minusDays(2);
    var nonExpiryDate = now.plusDays(2);
    var expiredDate = now.minusDays(1);
    var effectiveDateRange = new EffectiveDateRange(effectiveDate, nonExpiryDate);
    var expiredDateRange = new EffectiveDateRange(effectiveDate, expiredDate);

    GeneticWorthEntity firstEntity =
        new GeneticWorthEntity("AD", "Animal browse resistance (deer)", effectiveDateRange);
    geneticWorthRepository.saveAndFlush(firstEntity);
    GeneticWorthEntity secondEntity =
        new GeneticWorthEntity(
            "DFS",
            "Disease resistance for Dothistroma needle blight (Dothistroma septosporum)",
            effectiveDateRange);
    geneticWorthRepository.saveAndFlush(secondEntity);

    // This entity should not appear in the result list
    GeneticWorthEntity expiredEntity =
        new GeneticWorthEntity("V", "V for Vendetta", expiredDateRange);
    geneticWorthRepository.saveAndFlush(expiredEntity);

    List<GeneticWorthEntity> testEntityList =
        new ArrayList<>() {
          {
            add(firstEntity);
            add(secondEntity);
            add(expiredEntity);
          }
        };

    when(geneticWorthRepository.findAll()).thenReturn(testEntityList);

    List<CodeDescriptionDto> resultList = geneticWorthService.getAllGeneticWorth();

    CodeDescriptionDto firstMethod =
        new CodeDescriptionDto(firstEntity.getGeneticWorthCode(), firstEntity.getDescription());
    CodeDescriptionDto secondMethod =
        new CodeDescriptionDto(secondEntity.getGeneticWorthCode(), secondEntity.getDescription());

    List<CodeDescriptionDto> testDtoList =
        new ArrayList<>() {
          {
            add(firstMethod);
            add(secondMethod);
          }
        };

    Assertions.assertEquals(testEntityList.size() - 1, resultList.size());
    Assertions.assertEquals(testDtoList.size(), resultList.size());
    Assertions.assertEquals(testDtoList.get(0).code(), resultList.get(0).code());
    Assertions.assertEquals(testDtoList.get(0).description(), resultList.get(0).description());
    Assertions.assertEquals(testDtoList.get(1).code(), resultList.get(1).code());
    Assertions.assertEquals(testDtoList.get(1).description(), resultList.get(1).description());
  }

  @Test
  @DisplayName("getGeneticWorthByCodeServiceTest")
  void getGeneticWorthByCodeServiceTest() {
    var testCode = "AD";
    CodeDescriptionDto testDto =
        new CodeDescriptionDto(testCode, "Animal browse resistance (deer)");

    LocalDate now = LocalDate.now();
    var effectiveDate = now.minusDays(2);
    var nonExpiryDate = now.plusDays(2);
    var effectiveDateRange = new EffectiveDateRange(effectiveDate, nonExpiryDate);

    GeneticWorthEntity testEntity =
        new GeneticWorthEntity(testCode, "Animal browse resistance (deer)", effectiveDateRange);
    geneticWorthRepository.saveAndFlush(testEntity);

    when(geneticWorthRepository.findById(testCode)).thenReturn(Optional.of(testEntity));

    CodeDescriptionDto resultDto = geneticWorthService.getGeneticWorthByCode(testCode);

    Assertions.assertEquals(testDto.code(), resultDto.code());
    Assertions.assertEquals(testDto.description(), resultDto.description());
  }
}
