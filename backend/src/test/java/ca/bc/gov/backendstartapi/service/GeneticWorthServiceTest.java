package ca.bc.gov.backendstartapi.service;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthDto;
import ca.bc.gov.backendstartapi.entity.GeneticWorthEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.repository.GeneticWorthRepository;
import java.math.BigDecimal;
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

    BigDecimal defaultBv = BigDecimal.ZERO;

    GeneticWorthEntity firstEntity =
        new GeneticWorthEntity(
            "AD", "Animal browse resistance (deer)", effectiveDateRange, defaultBv);
    geneticWorthRepository.saveAndFlush(firstEntity);
    GeneticWorthEntity secondEntity =
        new GeneticWorthEntity(
            "DFS",
            "Disease resistance for Dothistroma needle blight (Dothistroma septosporum)",
            effectiveDateRange,
            defaultBv);
    geneticWorthRepository.saveAndFlush(secondEntity);

    // This entity should not appear in the result list
    GeneticWorthEntity expiredEntity =
        new GeneticWorthEntity("V", "V for Vendetta", expiredDateRange, defaultBv);
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

    List<GeneticWorthDto> resultList = geneticWorthService.getAllGeneticWorth();

    GeneticWorthDto firstMethod =
        new GeneticWorthDto(
            firstEntity.getGeneticWorthCode(), firstEntity.getDescription(), defaultBv);
    GeneticWorthDto secondMethod =
        new GeneticWorthDto(
            secondEntity.getGeneticWorthCode(), secondEntity.getDescription(), defaultBv);

    List<CodeDescriptionDto> testDtoList =
        new ArrayList<>() {
          {
            add(firstMethod);
            add(secondMethod);
          }
        };

    Assertions.assertEquals(testEntityList.size() - 1, resultList.size());
    Assertions.assertEquals(testDtoList.size(), resultList.size());
    Assertions.assertEquals(testDtoList.get(0).getCode(), resultList.get(0).getCode());
    Assertions.assertEquals(
        testDtoList.get(0).getDescription(), resultList.get(0).getDescription());
    Assertions.assertEquals(testDtoList.get(1).getCode(), resultList.get(1).getCode());
    Assertions.assertEquals(
        testDtoList.get(1).getDescription(), resultList.get(1).getDescription());
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
    BigDecimal defaultBv = BigDecimal.ZERO;

    GeneticWorthEntity testEntity =
        new GeneticWorthEntity(
            testCode, "Animal browse resistance (deer)", effectiveDateRange, defaultBv);
    geneticWorthRepository.saveAndFlush(testEntity);

    when(geneticWorthRepository.findById(testCode)).thenReturn(Optional.of(testEntity));

    CodeDescriptionDto resultDto = geneticWorthService.getGeneticWorthByCode(testCode);

    Assertions.assertEquals(testDto.getCode(), resultDto.getCode());
    Assertions.assertEquals(testDto.getDescription(), resultDto.getDescription());
  }

  @Test
  @DisplayName("calculate Ne happy path should succeed")
  void calculateNe_happyPath_shouldSucceed() {
    BigDecimal coancestry = null;
    BigDecimal varSumOrchGameteContr = new BigDecimal("0.03166229849840373670515625");
    BigDecimal varSumNeNoSmpContrib = new BigDecimal("0.04141688878940975160");
    Integer smpParentsOutside = 1;

    BigDecimal neValue =
        geneticWorthService.calculateNe(
            coancestry, varSumOrchGameteContr, varSumNeNoSmpContrib, smpParentsOutside);

    Assertions.assertNotNull(neValue);
    Assertions.assertEquals(new BigDecimal("21.1"), neValue);
  }

  @Test
  @DisplayName("calculate Ne with coancestry value should succeed")
  void calculateNe_withCoancestryValue_shouldSucceed() {
    BigDecimal coancestry = BigDecimal.ONE;
    BigDecimal varSumOrchGameteContr = BigDecimal.ZERO;
    BigDecimal varSumNeNoSmpContrib = BigDecimal.ZERO;
    Integer smpParentsOutside = 0;

    BigDecimal neValue =
        geneticWorthService.calculateNe(
            coancestry, varSumOrchGameteContr, varSumNeNoSmpContrib, smpParentsOutside);

    Assertions.assertNotNull(neValue);
    Assertions.assertEquals(new BigDecimal("0.5"), neValue);
  }

  @Test
  @DisplayName("calculate Ne without coancestry value should succeed")
  void calculateNe_withouCoancestryValue_shouldSucceed() {
    BigDecimal coancestry = BigDecimal.ZERO;
    BigDecimal varSumOrchGameteContr = new BigDecimal("0.03166229849840373670515625");
    BigDecimal varSumNeNoSmpContrib = new BigDecimal("0.04141688878940975160");
    Integer smpParentsOutside = 3;

    BigDecimal neValue =
        geneticWorthService.calculateNe(
            coancestry, varSumOrchGameteContr, varSumNeNoSmpContrib, smpParentsOutside);

    Assertions.assertNotNull(neValue);
    Assertions.assertEquals(new BigDecimal("0.0"), neValue);
  }
}
