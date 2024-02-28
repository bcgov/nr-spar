package ca.bc.gov.backendstartapi.service;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.LatLongRequestDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeLatLongDto;
import ca.bc.gov.backendstartapi.entity.ParentTreeEntity;
import ca.bc.gov.backendstartapi.repository.ParentTreeRepository;
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
  @DisplayName("getLatLongParentTreeData_successTest")
  void getLatLongParentTreeData_successTest() {
    ParentTreeEntity ptreeEntity = new ParentTreeEntity();
    ptreeEntity.setId(4110L);
    ptreeEntity.setLatitudeDegrees(49);
    ptreeEntity.setLatitudeMinutes(2);
    ptreeEntity.setLatitudeSeconds(0);
    ptreeEntity.setLongitudeDegrees(124);
    ptreeEntity.setLongitudeMinutes(3);
    ptreeEntity.setLongitudeSeconds(0);
    ptreeEntity.setElevation(451);

    when(parentTreeRepository.findAllIn(List.of(4110L))).thenReturn(List.of(ptreeEntity));

    List<LatLongRequestDto> ptIds = new ArrayList<>();
    ptIds.add(new LatLongRequestDto(4110L));

    List<ParentTreeLatLongDto> dtoList = parentTreeService.getLatLongParentTreeData(ptIds);

    Assertions.assertFalse(dtoList.isEmpty());
    Assertions.assertEquals(ptreeEntity.getId(), dtoList.get(0).getParentTreeId());
    Assertions.assertEquals(ptreeEntity.getLatitudeDegrees(), dtoList.get(0).getLatitudeDegrees());
    Assertions.assertEquals(ptreeEntity.getLatitudeMinutes(), dtoList.get(0).getLatitudeMinutes());
    Assertions.assertEquals(ptreeEntity.getLatitudeSeconds(), dtoList.get(0).getLatitudeSeconds());
    Assertions.assertEquals(
        ptreeEntity.getLongitudeDegrees(), dtoList.get(0).getLongitudeDegrees());
    Assertions.assertEquals(
        ptreeEntity.getLongitudeMinutes(), dtoList.get(0).getLongitudeMinutes());
    Assertions.assertEquals(
        ptreeEntity.getLongitudeSeconds(), dtoList.get(0).getLongitudeSeconds());
    Assertions.assertEquals(ptreeEntity.getElevation(), dtoList.get(0).getElevation());
  }

  @Test
  @DisplayName("getLatLongParentTreeData_emptyTest")
  void getLatLongParentTreeData_emptyTest() {
    when(parentTreeRepository.findAllIn(List.of(4110L))).thenReturn(List.of());

    List<LatLongRequestDto> ptIds = new ArrayList<>();
    ptIds.add(new LatLongRequestDto(4110L));

    List<ParentTreeLatLongDto> dtoList = parentTreeService.getLatLongParentTreeData(ptIds);

    Assertions.assertTrue(dtoList.isEmpty());
  }
}
