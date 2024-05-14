package ca.bc.gov.backendstartapi.service;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.GameticMethodologyDto;
import ca.bc.gov.backendstartapi.entity.GameticMethodologyEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.repository.GameticMethodologyRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class GameticMethodologyServiceTest {

  @Mock GameticMethodologyRepository gameticMethodologyRepository;
  private GameticMethodologyService gameticMethodologyService;

  @BeforeEach
  void setup() {
    gameticMethodologyService = new GameticMethodologyService(gameticMethodologyRepository);
  }

  @Test
  @DisplayName("getAllCollectionMethodServiceTest")
  void getAllCollectionMethod() {
    LocalDate now = LocalDate.now();
    var effectiveDate = now.minusDays(2);
    var nonExpiryDate = now.plusDays(2);
    var expiredDate = now.minusDays(1);
    var effectiveDateRange = new EffectiveDateRange(effectiveDate, nonExpiryDate);
    var expiredDateRange = new EffectiveDateRange(effectiveDate, expiredDate);

    GameticMethodologyEntity firstEntity =
        new GameticMethodologyEntity("F1", "Visual Estimate", true, false, effectiveDateRange);
    gameticMethodologyRepository.saveAndFlush(firstEntity);
    GameticMethodologyEntity secondEntity =
        new GameticMethodologyEntity(
            "F8", "Ramet Proportion by Clone", true, true, effectiveDateRange);
    gameticMethodologyRepository.saveAndFlush(secondEntity);
    GameticMethodologyEntity thirdEntity =
        new GameticMethodologyEntity(
            "M1", "Portion of Ramets in Orchard", false, false, effectiveDateRange);
    gameticMethodologyRepository.saveAndFlush(thirdEntity);
    GameticMethodologyEntity fourthEntity =
        new GameticMethodologyEntity(
            "M5",
            "Ramet Proportion by Age and Expected Production",
            false,
            true,
            effectiveDateRange);
    gameticMethodologyRepository.saveAndFlush(fourthEntity);
    // This entity should not appear in the result list
    GameticMethodologyEntity expiredEntity =
        new GameticMethodologyEntity(
            "MI6", "The Secret Intelligence Service", false, false, expiredDateRange);
    gameticMethodologyRepository.saveAndFlush(expiredEntity);

    List<GameticMethodologyEntity> testEntityList =
        new ArrayList<>() {
          {
            add(firstEntity);
            add(secondEntity);
            add(thirdEntity);
            add(fourthEntity);
            add(expiredEntity);
          }
        };

    when(gameticMethodologyRepository.findAll()).thenReturn(testEntityList);

    List<GameticMethodologyDto> resultList = gameticMethodologyService.getAllGameticMethodologies();

    GameticMethodologyDto firstMethod =
        new GameticMethodologyDto(
            firstEntity.getGameticMethodologyCode(),
            firstEntity.getDescription(),
            firstEntity.isFemaleMethodology(),
            firstEntity.isPliSpecies());
    GameticMethodologyDto secondMethod =
        new GameticMethodologyDto(
            secondEntity.getGameticMethodologyCode(),
            secondEntity.getDescription(),
            secondEntity.isFemaleMethodology(),
            secondEntity.isPliSpecies());
    GameticMethodologyDto thirdMethod =
        new GameticMethodologyDto(
            thirdEntity.getGameticMethodologyCode(),
            thirdEntity.getDescription(),
            thirdEntity.isFemaleMethodology(),
            thirdEntity.isPliSpecies());
    GameticMethodologyDto fourthMethod =
        new GameticMethodologyDto(
            fourthEntity.getGameticMethodologyCode(),
            fourthEntity.getDescription(),
            fourthEntity.isFemaleMethodology(),
            fourthEntity.isPliSpecies());

    List<GameticMethodologyDto> testDtoList =
        new ArrayList<>() {
          {
            add(firstMethod);
            add(secondMethod);
            add(thirdMethod);
            add(fourthMethod);
          }
        };

    Assertions.assertEquals(testEntityList.size() - 1, resultList.size());
    Assertions.assertEquals(testDtoList.size(), resultList.size());

    IntStream.range(0, resultList.size())
        .forEach(
            index -> {
              Assertions.assertEquals(testDtoList.get(index).code(), resultList.get(index).code());
              Assertions.assertEquals(
                  testDtoList.get(index).description(), resultList.get(index).description());
              Assertions.assertEquals(
                  testDtoList.get(index).isFemaleMethodology(),
                  resultList.get(index).isFemaleMethodology());
              Assertions.assertEquals(
                  testDtoList.get(index).isPliSpecies(), resultList.get(index).isPliSpecies());
            });
  }
}
