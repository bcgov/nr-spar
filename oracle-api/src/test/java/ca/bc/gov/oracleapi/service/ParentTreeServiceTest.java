package ca.bc.gov.oracleapi.service;

import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.GeospatialRequestDto;
import ca.bc.gov.oracleapi.dto.GeospatialRespondDto;
import ca.bc.gov.oracleapi.dto.ParentTreeByVegCodeDto;
import ca.bc.gov.oracleapi.entity.ParentTreeEntity;
import ca.bc.gov.oracleapi.entity.projection.ParentTreeProj;
import ca.bc.gov.oracleapi.repository.ParentTreeRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ParentTreeServiceTest {

  @Mock ParentTreeRepository parentTreeRepository;

  private ParentTreeService parentTreeService;

  private ParentTreeProj mockParentTreeProj() {
    return new ParentTreeProj() {

      @Override
      public Long getParentTreeId() {
        return 20012L;
      }

      @Override
      public String getParentTreeNumber() {
        return "29";
      }

      @Override
      public String getOrchardId() {
        return "211";
      }

      @Override
      public Long getSpu() {
        return 68L;
      }

      @Override
      public Character getTested() {
        return 'Y';
      }

      @Override
      public String getGeneticTypeCode() {
        return "BV";
      }

      @Override
      public String getGeneticWorthCode() {
        return "GVO";
      }

      @Override
      public BigDecimal getGeneticQualityValue() {
        return new BigDecimal("15");
      }

      @Override
      public void setParentTreeId(Long parentTreeId) {}

      @Override
      public void setParentTreeNumber(String parentTreeNumber) {}

      @Override
      public void setOrchardId(String orchardId) {}

      @Override
      public void setSpu(Long spu) {}

      @Override
      public void setTested(Character tested) {}

      @Override
      public void setGeneticTypeCode(String geneticTypeCode) {}

      @Override
      public void setGeneticWorthCode(String geneticWorthCode) {}

      @Override
      public void setGeneticQualityValue(BigDecimal geneticQualityValue) {}
    };
  }

  @BeforeEach
  void setup() {
    parentTreeService = new ParentTreeService(parentTreeRepository);
  }

  @Test
  @DisplayName("getPtGeoSpatialData_successTest")
  void getPtGeoSpatialData_successTest() {
    ParentTreeEntity ptreeEntity = new ParentTreeEntity();
    ptreeEntity.setId(4110L);
    ptreeEntity.setLatitudeDegrees(49);
    ptreeEntity.setLatitudeMinutes(2);
    ptreeEntity.setLatitudeSeconds(0);
    ptreeEntity.setLongitudeDegrees(124);
    ptreeEntity.setLongitudeMinutes(3);
    ptreeEntity.setLongitudeSeconds(0);
    ptreeEntity.setElevation(451);

    when(parentTreeRepository.findAllByIdIn(List.of(4110L))).thenReturn(List.of(ptreeEntity));

    List<GeospatialRequestDto> ptIds = new ArrayList<>();
    ptIds.add(new GeospatialRequestDto(4110L));

    List<GeospatialRespondDto> dtoList = parentTreeService.getPtGeoSpatialData(ptIds);

    Assertions.assertFalse(dtoList.isEmpty());
    Assertions.assertEquals(ptreeEntity.getId(), dtoList.get(0).parentTreeId());
    Assertions.assertEquals(ptreeEntity.getLatitudeDegrees(), dtoList.get(0).latitudeDegree());
    Assertions.assertEquals(ptreeEntity.getLatitudeMinutes(), dtoList.get(0).latitudeMinute());
    Assertions.assertEquals(ptreeEntity.getLatitudeSeconds(), dtoList.get(0).latitudeSecond());
    Assertions.assertEquals(ptreeEntity.getLongitudeDegrees(), dtoList.get(0).longitudeDegree());
    Assertions.assertEquals(ptreeEntity.getLongitudeMinutes(), dtoList.get(0).longitudeMinute());
    Assertions.assertEquals(ptreeEntity.getLongitudeSeconds(), dtoList.get(0).longitudeSecond());
    Assertions.assertEquals(ptreeEntity.getElevation(), dtoList.get(0).elevation());
  }

  @Test
  @DisplayName("getPtGeoSpatialData_emptyTest")
  void getPtGeoSpatialData_emptyTest() {
    when(parentTreeRepository.findAllByIdIn(List.of(4110L))).thenReturn(List.of());

    List<GeospatialRequestDto> ptIds = new ArrayList<>();
    ptIds.add(new GeospatialRequestDto(4110L));

    List<GeospatialRespondDto> dtoList = parentTreeService.getPtGeoSpatialData(ptIds);

    Assertions.assertTrue(dtoList.isEmpty());
  }

  @Test
  @DisplayName("Find parent trees with veg code happy path should succeed")
  void findParentTreesWithVegCode_happyPath_shouldSucceed() {
    String vegCode = "SX";

    ParentTreeProj parentProj = mockParentTreeProj();

    when(parentTreeRepository.findAllParentTreeWithVegCode(vegCode))
        .thenReturn(List.of(parentProj));

    Map<String, ParentTreeByVegCodeDto> response =
        parentTreeService.findParentTreesWithVegCode(vegCode);

    Assertions.assertNotNull(response);
    Assertions.assertEquals(1, response.size());
    Assertions.assertTrue(response.containsKey("29"));
  }
}
