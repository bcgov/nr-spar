package ca.bc.gov.backendstartapi.service;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthSummaryDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsRequestDto;
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

  private GeneticWorthTraitsDto createDto(String trait, String volumeGrowth) {
    return new GeneticWorthTraitsDto(trait, new BigDecimal(volumeGrowth), null, null);
  }

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

  @Test
  @DisplayName("calculateGeneticWorth_Success")
  void calculateGeneticWorth_Success() {
    List<GeneticWorthTraitsRequestDto> requestList = new ArrayList<>();

    // 129
    GeneticWorthTraitsDto dto129gvo = createDto("gvo", "18");
    GeneticWorthTraitsDto dto129wwd = createDto("wwd", "-2.2");
    GeneticWorthTraitsRequestDto requestDto129 =
        new GeneticWorthTraitsRequestDto(
            "129", new BigDecimal("13"), new BigDecimal("48.5"), List.of(dto129gvo, dto129wwd));
    requestList.add(requestDto129);

    // 212
    GeneticWorthTraitsDto dto212gvo = createDto("gvo", "20");
    GeneticWorthTraitsDto dto212wwd = createDto("wwd", "1.7");
    GeneticWorthTraitsRequestDto requestDto212 =
        new GeneticWorthTraitsRequestDto(
            "212", new BigDecimal("8.5"), new BigDecimal("49"), List.of(dto212gvo, dto212wwd));
    requestList.add(requestDto212);

    // 300
    GeneticWorthTraitsDto dto300gvo = createDto("gvo", "15");
    GeneticWorthTraitsDto dto300wwd = createDto("wwd", "-0.8");
    GeneticWorthTraitsRequestDto requestDto300 =
        new GeneticWorthTraitsRequestDto(
            "300", new BigDecimal("129.5"), new BigDecimal("93"), List.of(dto300gvo, dto300wwd));
    requestList.add(requestDto300);

    // 3141
    GeneticWorthTraitsDto dto3141gvo = createDto("gvo", "23");
    GeneticWorthTraitsDto dto3141wwd = createDto("wwd", "-2.1");
    GeneticWorthTraitsRequestDto requestDto3141 =
        new GeneticWorthTraitsRequestDto(
            "3141",
            new BigDecimal("71.20833333"),
            new BigDecimal("35"),
            List.of(dto3141gvo, dto3141wwd));
    requestList.add(requestDto3141);

    // 3144
    GeneticWorthTraitsDto dto3144gvo = createDto("gvo", "25");
    GeneticWorthTraitsDto dto3144wwd = createDto("wwd", "-0.6");
    GeneticWorthTraitsRequestDto requestDto3144 =
        new GeneticWorthTraitsRequestDto(
            "3144",
            new BigDecimal("42.541666667"),
            new BigDecimal("92.5"),
            List.of(dto3144gvo, dto3144wwd));
    requestList.add(requestDto3144);

    // 3169
    GeneticWorthTraitsDto dto3169gvo = createDto("gvo", "19");
    GeneticWorthTraitsDto dto3169wwd = createDto("wwd", "-2.3");
    GeneticWorthTraitsRequestDto requestDto3169 =
        new GeneticWorthTraitsRequestDto(
            "3169",
            new BigDecimal("30.083333333"),
            new BigDecimal("27"),
            List.of(dto3169gvo, dto3169wwd));
    requestList.add(requestDto3169);

    // 3210
    GeneticWorthTraitsDto dto3210gvo = createDto("gvo", "17");
    GeneticWorthTraitsDto dto3210wwd = createDto("wwd", "1.1");
    GeneticWorthTraitsRequestDto requestDto3210 =
        new GeneticWorthTraitsRequestDto(
            "3210", new BigDecimal("6"), new BigDecimal("0"), List.of(dto3210gvo, dto3210wwd));
    requestList.add(requestDto3210);

    // 3245
    GeneticWorthTraitsDto dto3245gvo = createDto("gvo", "19");
    GeneticWorthTraitsDto dto3245wwd = createDto("wwd", "-2.3");
    GeneticWorthTraitsRequestDto requestDto3245 =
        new GeneticWorthTraitsRequestDto(
            "3245",
            new BigDecimal("152"),
            new BigDecimal("154.5"),
            List.of(dto3245gvo, dto3245wwd));
    requestList.add(requestDto3245);

    LocalDate yesterday = LocalDate.now().minusDays(1L);
    LocalDate tomorrow = LocalDate.now().plusDays(1L);
    EffectiveDateRange dateRange = new EffectiveDateRange(yesterday, tomorrow);
    GeneticWorthEntity gvoGw = new GeneticWorthEntity("gvo", "anything", dateRange);
    GeneticWorthEntity wwdGw = new GeneticWorthEntity("wwd", "something", dateRange);
    when(geneticWorthRepository.findAll()).thenReturn(List.of(gvoGw, wwdGw));

    GeneticWorthSummaryDto summaryDto = geneticWorthService.calculateGeneticWorth(requestList);

    Assertions.assertNotNull(summaryDto);
    Assertions.assertEquals(2, summaryDto.geneticTraits().size());
  }
}
