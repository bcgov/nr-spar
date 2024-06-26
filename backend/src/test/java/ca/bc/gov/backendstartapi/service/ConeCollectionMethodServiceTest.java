package ca.bc.gov.backendstartapi.service;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.entity.ConeCollectionMethodEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.repository.ConeCollectionMethodRepository;
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
class ConeCollectionMethodServiceTest {

  @Mock ConeCollectionMethodRepository coneCollectionMethodRepository;
  private ConeCollectionMethodService coneCollectionMethodService;

  @BeforeEach
  void setup() {
    coneCollectionMethodService = new ConeCollectionMethodService(coneCollectionMethodRepository);
  }

  @Test
  @DisplayName("getAllCollectionMethod")
  void getAllCollectionMethod() {

    LocalDate now = LocalDate.now();
    var effectiveDate = now.minusDays(2);
    var nonExpiryDate = now.plusDays(2);
    var expiredDate = now.minusDays(1);
    var effectiveDateRange = new EffectiveDateRange(effectiveDate, nonExpiryDate);
    var expiredDateRange = new EffectiveDateRange(effectiveDate, expiredDate);

    ConeCollectionMethodEntity firstEntity =
        new ConeCollectionMethodEntity(1, "Aerial raking", effectiveDateRange);
    coneCollectionMethodRepository.saveAndFlush(firstEntity);
    ConeCollectionMethodEntity secondEntity =
        new ConeCollectionMethodEntity(2, "Aerial clipping/topping", effectiveDateRange);
    coneCollectionMethodRepository.saveAndFlush(secondEntity);
    ConeCollectionMethodEntity thirdEntity =
        new ConeCollectionMethodEntity(3, "Felled trees", effectiveDateRange);
    coneCollectionMethodRepository.saveAndFlush(thirdEntity);
    // This entity should not appear in the result list
    ConeCollectionMethodEntity expiredEntity =
        new ConeCollectionMethodEntity(4, "Metal detector", expiredDateRange);
    coneCollectionMethodRepository.saveAndFlush(expiredEntity);

    List<ConeCollectionMethodEntity> testEntityList =
        new ArrayList<>() {
          {
            add(firstEntity);
            add(secondEntity);
            add(thirdEntity);
            add(expiredEntity);
          }
        };

    when(coneCollectionMethodRepository.findAll()).thenReturn(testEntityList);

    CodeDescriptionDto firstMethod =
        new CodeDescriptionDto(
            String.valueOf(firstEntity.getConeCollectionMethodCode()),
            firstEntity.getDescription());
    CodeDescriptionDto secondMethod =
        new CodeDescriptionDto(
            String.valueOf(secondEntity.getConeCollectionMethodCode()),
            secondEntity.getDescription());
    CodeDescriptionDto thirdMethod =
        new CodeDescriptionDto(
            String.valueOf(thirdEntity.getConeCollectionMethodCode()),
            thirdEntity.getDescription());

    List<CodeDescriptionDto> testDtoList =
        new ArrayList<>() {
          {
            add(firstMethod);
            add(secondMethod);
            add(thirdMethod);
          }
        };

    List<CodeDescriptionDto> resultList = coneCollectionMethodService.getAllConeCollectionMethods();

    Assertions.assertEquals(testEntityList.size() - 1, resultList.size());
    Assertions.assertEquals(testDtoList.size(), resultList.size());
    Assertions.assertEquals(testDtoList.get(0).getCode(), resultList.get(0).getCode());
    Assertions.assertEquals(
        testDtoList.get(0).getDescription(), resultList.get(0).getDescription());
    Assertions.assertEquals(testDtoList.get(1).getCode(), resultList.get(1).getCode());
    Assertions.assertEquals(
        testDtoList.get(1).getDescription(), resultList.get(1).getDescription());
    Assertions.assertEquals(testDtoList.get(2).getCode(), resultList.get(2).getCode());
    Assertions.assertEquals(
        testDtoList.get(2).getDescription(), resultList.get(2).getDescription());
  }
}
