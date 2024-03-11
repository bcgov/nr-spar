package ca.bc.gov.backendstartapi.service;

import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.LatLongRequestDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeLocInfoDto;
import ca.bc.gov.backendstartapi.provider.OracleApiProvider;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class ParentTreeServiceTest {

  @Mock OracleApiProvider oracleApiProvider;

  private ParentTreeService parentTreeService;

  @BeforeEach
  void setup() {
    parentTreeService = new ParentTreeService(oracleApiProvider);
  }

  @Test
  @DisplayName("getLatLongElevation success test should succeed")
  void getLatLongElevation_successTest() {
    ParentTreeLocInfoDto oracleDto = new ParentTreeLocInfoDto();
    oracleDto.setParentTreeId(4032);
    oracleDto.setLatitudeDegrees(49);
    oracleDto.setLatitudeMinutes(2);
    oracleDto.setLatitudeSeconds(0);
    oracleDto.setLongitudeDegrees(-124);
    oracleDto.setLongitudeMinutes(3);
    oracleDto.setLongitudeSeconds(0);
    oracleDto.setElevation(549);

    List<Integer> ptIds = List.of(4032);
    when(oracleApiProvider.getParentTreeLatLongByIdList(ptIds)).thenReturn(List.of(oracleDto));

    LatLongRequestDto requestDto = new LatLongRequestDto(4032, new BigDecimal("0.5"));

    List<ParentTreeLocInfoDto> resp = parentTreeService.getLatLongElevation(List.of(requestDto));

    Assertions.assertFalse(resp.isEmpty());
    Assertions.assertEquals(1, resp.size());
    // values kept
    Assertions.assertEquals(oracleDto.getParentTreeId(), resp.get(0).getParentTreeId());
    Assertions.assertEquals(oracleDto.getLatitudeDegrees(), resp.get(0).getLatitudeDegrees());
    Assertions.assertEquals(oracleDto.getLatitudeMinutes(), resp.get(0).getLatitudeMinutes());
    Assertions.assertEquals(oracleDto.getLatitudeSeconds(), resp.get(0).getLatitudeSeconds());
    Assertions.assertEquals(oracleDto.getLongitudeDegrees(), resp.get(0).getLongitudeDegrees());
    Assertions.assertEquals(oracleDto.getLongitudeMinutes(), resp.get(0).getLongitudeMinutes());
    Assertions.assertEquals(oracleDto.getLongitudeSeconds(), resp.get(0).getLongitudeSeconds());
    Assertions.assertEquals(oracleDto.getElevation(), resp.get(0).getElevation());
    // values added
    Assertions.assertEquals(new BigDecimal("49.033333"), resp.get(0).getLatitudeDegreesFmt());
    Assertions.assertEquals(new BigDecimal("124.050000"), resp.get(0).getLongitudeDegreeFmt());
    Assertions.assertEquals(new BigDecimal("1471.0000000"), resp.get(0).getWeightedLatitude());
    Assertions.assertEquals(new BigDecimal("3721.5000000"), resp.get(0).getWeightedLongitude());
    Assertions.assertEquals(new BigDecimal("274.5"), resp.get(0).getWeightedElevation());
  }

  @Test
  @DisplayName("getLatLongElevation oracle empty test should succeed")
  void getLatLongElevation_oracleEmptyTest() {
    List<Integer> ptIds = List.of(4032);
    when(oracleApiProvider.getParentTreeLatLongByIdList(ptIds)).thenReturn(List.of());

    LatLongRequestDto requestDto = new LatLongRequestDto(4032, new BigDecimal("0.5"));

    List<ParentTreeLocInfoDto> resp = parentTreeService.getLatLongElevation(List.of(requestDto));

    Assertions.assertTrue(resp.isEmpty());
  }
}
