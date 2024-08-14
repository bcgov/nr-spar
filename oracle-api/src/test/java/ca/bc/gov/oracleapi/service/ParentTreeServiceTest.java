package ca.bc.gov.oracleapi.service;

import static org.mockito.Mockito.when;

import ca.bc.gov.oracleapi.dto.GeospatialRequestDto;
import ca.bc.gov.oracleapi.dto.GeospatialRespondDto;
import ca.bc.gov.oracleapi.entity.ParentTreeEntity;
import ca.bc.gov.oracleapi.repository.ParentTreeRepository;
import java.util.ArrayList;
import java.util.List;
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
}
