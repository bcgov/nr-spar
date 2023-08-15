package ca.bc.gov.backendstartapi.service;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.entity.SeedlotSourceEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.repository.SeedlotSourceRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class SeedlotSourceServiceTest {

  @Mock SeedlotSourceRepository seedlotSourceRepository;
  private SeedlotSourceService seedlotSourceService;

  @BeforeEach
  void setup() {
    seedlotSourceService = new SeedlotSourceService(seedlotSourceRepository);
  }

  @Test
  @DisplayName("getAllSeedlotSourceServiceTest")
  void getAllSeedlotSourceServiceTest() {
    LocalDate now = LocalDate.now();
    var effectiveDate = now.minusDays(2);
    var nonExpiryDate = now.plusDays(2);
    var expiredDate = now.minusDays(1);
    var effectiveDateRange = new EffectiveDateRange(effectiveDate, nonExpiryDate);
    var expiredDateRange = new EffectiveDateRange(effectiveDate, expiredDate);

    SeedlotSourceEntity firstEntity =
        new SeedlotSourceEntity("CUS", "Custom Lot", effectiveDateRange);
    seedlotSourceRepository.saveAndFlush(firstEntity);
    SeedlotSourceEntity secondEntity =
        new SeedlotSourceEntity("TPT", "Tested Parent Trees", effectiveDateRange);
    seedlotSourceRepository.saveAndFlush(secondEntity);

    // This entity should not appear in the result list
    SeedlotSourceEntity expiredEntity =
        new SeedlotSourceEntity("V", "V for Vendetta", expiredDateRange);
    seedlotSourceRepository.saveAndFlush(expiredEntity);

    List<SeedlotSourceEntity> testEntityList =
        new ArrayList<>() {
          {
            add(firstEntity);
            add(secondEntity);
            add(expiredEntity);
          }
        };

    when(seedlotSourceRepository.findAll()).thenReturn(testEntityList);

    CodeDescriptionDto firstMethod =
        new CodeDescriptionDto(firstEntity.getSeedlotSourceCode(), firstEntity.getDescription());
    CodeDescriptionDto secondMethod =
        new CodeDescriptionDto(secondEntity.getSeedlotSourceCode(), secondEntity.getDescription());

    List<CodeDescriptionDto> testDtoList =
        new ArrayList<>() {
          {
            add(firstMethod);
            add(secondMethod);
          }
        };

    List<CodeDescriptionDto> resultList = seedlotSourceService.getAllSeedlotSource();

    Assertions.assertEquals(testEntityList.size() - 1, resultList.size());
    Assertions.assertEquals(testDtoList.size(), resultList.size());
    Assertions.assertEquals(testDtoList.get(0).code(), resultList.get(0).code());
    Assertions.assertEquals(testDtoList.get(0).description(), resultList.get(0).description());
    Assertions.assertEquals(testDtoList.get(1).code(), resultList.get(1).code());
    Assertions.assertEquals(testDtoList.get(1).description(), resultList.get(1).description());
  }
}
