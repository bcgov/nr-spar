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

  private ParentTreeEntity mock(
      Long id, Integer elevation, Integer[] lat, Integer[] lng, Long femaleId, Long maleId) {
    ParentTreeEntity ptreeEntityReq1 = new ParentTreeEntity();
    ptreeEntityReq1.setId(id);
    ptreeEntityReq1.setLatitudeDegrees(lat == null ? null : lat[0]);
    ptreeEntityReq1.setLatitudeMinutes(lat == null ? null : lat[1]);
    ptreeEntityReq1.setLatitudeSeconds(lat == null ? null : lat[2]);
    ptreeEntityReq1.setLongitudeDegrees(lng == null ? null : lng[0]);
    ptreeEntityReq1.setLongitudeMinutes(lng == null ? null : lng[1]);
    ptreeEntityReq1.setLongitudeSeconds(lng == null ? null : lng[2]);
    ptreeEntityReq1.setElevation(elevation);
    ptreeEntityReq1.setFemaleParentTreeId(femaleId);
    ptreeEntityReq1.setMaleParentTreeId(maleId);
    return ptreeEntityReq1;
  }

  private ParentTreeEntity mockNull(Long id, Long femaleId, Long maleId) {
    return mock(id, null, null, null, femaleId, maleId);
  }

  @Test
  @DisplayName("Get parent tree geo spatial data hierarchy tree should succeed")
  void getPtGeoSpatialData_hierarchyTree_shouldSucceed() {
    /*
     * TEST CASE: PT id 1002614 = mean elevation is 675 - female parent id 4168 (elevation 610) -
     * male parent id 4638 (elevation 740) PT id 1001097 = mean elevation is 465 - female parent id
     * 4668 (elevation 823) - male parent id 4628 (elevation 107) PT id 1001096 = mean elevation is
     * 465 - female parent id 4668 (elevation 823) - male parent id 4628 (elevation 107) PT id
     * 1004423 = mean elevation is 526 - female parent id 1000031 = mean elevation is 573 - female
     * parent id 4700 (elevation 628) - male parent id 4035 (elevation 518) - male parent id 1004424
     * = mean elevation is 480 - female parent id 4035 (elevation 518) - male parent id 4078
     * (elevation 442) PT id 1001093 = mean elevation is 84 - female parent id 4197 (elevation 61) -
     * male parent id 4182 (elevation 107)
     */

    // First run start
    ParentTreeEntity ptreeRoot1 = mockNull(1002614L, 4168L, 4638L);
    ParentTreeEntity ptreeRoot2 = mockNull(1001097L, 4668L, 4628L);
    ParentTreeEntity ptreeRoot3 = mockNull(1001096L, 4668L, 4628L);
    ParentTreeEntity ptreeRoot4 = mockNull(1004423L, 1000031L, 1004424L);
    ParentTreeEntity ptreeRoot5 = mockNull(1001093L, 4197L, 4182L);

    List<Long> firstRequestList =
        List.of(
            ptreeRoot1.getId(),
            ptreeRoot2.getId(),
            ptreeRoot3.getId(),
            ptreeRoot4.getId(),
            ptreeRoot5.getId());

    List<ParentTreeEntity> firstResponseList =
        List.of(ptreeRoot1, ptreeRoot2, ptreeRoot3, ptreeRoot4, ptreeRoot5);

    when(parentTreeRepository.findAllByIdIn(firstRequestList)).thenReturn(firstResponseList);
    // First run end

    // Second run start
    ParentTreeEntity ptreeRoot1Mother =
        mock(4168L, 610, new Integer[] {49, 7, 0}, new Integer[] {121, 36, 0}, null, null);
    ParentTreeEntity ptreeRoot1Father =
        mock(4638L, 740, new Integer[] {48, 5, 0}, new Integer[] {124, 0, 0}, null, null);
    ParentTreeEntity ptreeRoot2Mother =
        mock(4668L, 823, new Integer[] {49, 7, 0}, new Integer[] {121, 49, 0}, null, null);
    ParentTreeEntity ptreeRoot2Father =
        mock(4628L, 107, new Integer[] {49, 40, 0}, new Integer[] {125, 50, 3}, null, null);
    ParentTreeEntity ptreeRoot3Mother =
        mock(4668L, 823, new Integer[] {49, 7, 0}, new Integer[] {121, 49, 0}, null, null);
    ParentTreeEntity ptreeRoot3Father =
        mock(4628L, 107, new Integer[] {49, 40, 0}, new Integer[] {125, 50, 3}, null, null);
    ParentTreeEntity ptreeRoot4Mother = mockNull(1000031L, 4700L, 4035L);
    ParentTreeEntity ptreeRoot4Father = mockNull(1004424L, 4035L, 4078L);
    ParentTreeEntity ptreeRoot5Mother =
        mock(4197L, 61, new Integer[] {49, 54, 0}, new Integer[] {126, 49, 0}, null, null);
    ParentTreeEntity ptreeRoot5Father =
        mock(4182L, 107, new Integer[] {50, 1, 0}, new Integer[] {127, 16, 0}, null, null);

    List<Long> secondRequestList =
        List.of(
            ptreeRoot1Mother.getId(),
            ptreeRoot1Father.getId(),
            ptreeRoot2Mother.getId(),
            ptreeRoot2Father.getId(),
            ptreeRoot3Mother.getId(),
            ptreeRoot3Father.getId(),
            ptreeRoot4Mother.getId(),
            ptreeRoot4Father.getId(),
            ptreeRoot5Mother.getId(),
            ptreeRoot5Father.getId());

    List<ParentTreeEntity> secondResponseList =
        List.of(
            ptreeRoot1Mother,
            ptreeRoot1Father,
            ptreeRoot2Mother,
            ptreeRoot2Father,
            ptreeRoot3Mother,
            ptreeRoot3Father,
            ptreeRoot4Mother,
            ptreeRoot4Father,
            ptreeRoot5Mother,
            ptreeRoot5Father);

    when(parentTreeRepository.findAllByIdIn(secondRequestList)).thenReturn(secondResponseList);
    // Second run end

    // Third run start
    ParentTreeEntity ptreeRoot4MotherGranMother =
        mock(4700L, 628, new Integer[] {49, 22, 0}, new Integer[] {123, 13, 0}, null, null);
    ParentTreeEntity ptreeRoot4MotherGranFather =
        mock(4035L, 518, new Integer[] {49, 2, 0}, new Integer[] {124, 3, 0}, null, null);
    ParentTreeEntity ptreeRoot4FatherGranMother =
        mock(4035L, 518, new Integer[] {49, 2, 0}, new Integer[] {124, 3, 0}, null, null);
    ParentTreeEntity ptreeRoot4FatherGranFather =
        mock(4078L, 442, new Integer[] {48, 28, 0}, new Integer[] {123, 40, 0}, null, null);

    List<Long> thirdRequestList =
        List.of(
            ptreeRoot4MotherGranMother.getId(),
            ptreeRoot4MotherGranFather.getId(),
            ptreeRoot4FatherGranMother.getId(),
            ptreeRoot4FatherGranFather.getId());

    List<ParentTreeEntity> thirdResponseList =
        List.of(
            ptreeRoot4MotherGranMother,
            ptreeRoot4MotherGranFather,
            ptreeRoot4FatherGranMother,
            ptreeRoot4FatherGranFather);

    when(parentTreeRepository.findAllByIdIn(thirdRequestList)).thenReturn(thirdResponseList);
    // Third run end

    List<GeospatialRequestDto> ptIds = new ArrayList<>();
    ptIds.add(new GeospatialRequestDto(ptreeRoot1.getId()));
    ptIds.add(new GeospatialRequestDto(ptreeRoot2.getId()));
    ptIds.add(new GeospatialRequestDto(ptreeRoot3.getId()));
    ptIds.add(new GeospatialRequestDto(ptreeRoot4.getId()));
    ptIds.add(new GeospatialRequestDto(ptreeRoot5.getId()));

    List<GeospatialRespondDto> dtoList = parentTreeService.getPtGeoSpatialData(ptIds);

    Assertions.assertFalse(dtoList.isEmpty());
    Assertions.assertEquals(5, dtoList.size());

    // First: 1001097
    Assertions.assertEquals(ptreeRoot2.getId(), dtoList.get(0).parentTreeId());
    Assertions.assertEquals(465, dtoList.get(0).elevation());
    Assertions.assertEquals(49, dtoList.get(0).latitudeDegree());
    Assertions.assertEquals(23, dtoList.get(0).latitudeMinute());
    Assertions.assertEquals(30, dtoList.get(0).latitudeSecond());
    Assertions.assertEquals(123, dtoList.get(0).longitudeDegree());
    Assertions.assertEquals(49, dtoList.get(0).longitudeMinute());
    Assertions.assertEquals(31, dtoList.get(0).longitudeSecond());

    // Second: 1001096
    Assertions.assertEquals(ptreeRoot3.getId(), dtoList.get(1).parentTreeId());
    Assertions.assertEquals(465, dtoList.get(1).elevation());
    Assertions.assertEquals(49, dtoList.get(1).latitudeDegree());
    Assertions.assertEquals(23, dtoList.get(1).latitudeMinute());
    Assertions.assertEquals(30, dtoList.get(1).latitudeSecond());
    Assertions.assertEquals(123, dtoList.get(1).longitudeDegree());
    Assertions.assertEquals(49, dtoList.get(1).longitudeMinute());
    Assertions.assertEquals(31, dtoList.get(1).longitudeSecond());

    // Third: 1004423
    Assertions.assertEquals(ptreeRoot4.getId(), dtoList.get(2).parentTreeId());
    Assertions.assertEquals(526, dtoList.get(2).elevation());
    Assertions.assertEquals(48, dtoList.get(2).latitudeDegree());
    Assertions.assertEquals(58, dtoList.get(2).latitudeMinute());
    Assertions.assertEquals(30, dtoList.get(2).latitudeSecond());
    Assertions.assertEquals(123, dtoList.get(2).longitudeDegree());
    Assertions.assertEquals(44, dtoList.get(2).longitudeMinute());
    Assertions.assertEquals(45, dtoList.get(2).longitudeSecond());

    // Fourth: 1002614L
    Assertions.assertEquals(ptreeRoot1.getId(), dtoList.get(3).parentTreeId());
    Assertions.assertEquals(675, dtoList.get(3).elevation());
    Assertions.assertEquals(48, dtoList.get(3).latitudeDegree());
    Assertions.assertEquals(36, dtoList.get(3).latitudeMinute());
    Assertions.assertEquals(0, dtoList.get(3).latitudeSecond());
    Assertions.assertEquals(122, dtoList.get(3).longitudeDegree());
    Assertions.assertEquals(48, dtoList.get(3).longitudeMinute());
    Assertions.assertEquals(0, dtoList.get(3).longitudeSecond());

    // Fifth: 1001093L
    Assertions.assertEquals(ptreeRoot5.getId(), dtoList.get(4).parentTreeId());
    Assertions.assertEquals(84, dtoList.get(4).elevation());
    Assertions.assertEquals(49, dtoList.get(4).latitudeDegree());
    Assertions.assertEquals(57, dtoList.get(4).latitudeMinute());
    Assertions.assertEquals(30, dtoList.get(4).latitudeSecond());
    Assertions.assertEquals(127, dtoList.get(4).longitudeDegree());
    Assertions.assertEquals(2, dtoList.get(4).longitudeMinute());
    Assertions.assertEquals(30, dtoList.get(4).longitudeSecond());
  }
}
