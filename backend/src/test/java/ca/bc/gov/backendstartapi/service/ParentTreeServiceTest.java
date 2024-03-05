package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.LatLongRequestDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeLatLongDto;
import ca.bc.gov.backendstartapi.provider.OracleApiProvider;

import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
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
  void getLatLongElevation_successTest() {
    GeneticWorthTraitsDto traitsDto =
        new GeneticWorthTraitsDto("gvo", new BigDecimal("18"), null, null);
    LatLongRequestDto requestDto =
        new LatLongRequestDto(
            4032, true, new BigDecimal("255"), new BigDecimal("100"), List.of(traitsDto));

    ParentTreeLatLongDto oracleDto = new ParentTreeLatLongDto();
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

    List<ParentTreeLatLongDto> resp = parentTreeService.getLatLongElevation(List.of(requestDto));

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
    Assertions.assertEquals(new BigDecimal("294200.000000"), resp.get(0).getWeightedLatitude());
    Assertions.assertEquals("-4118.729941539", resp.get(0).getWeightedLongitude());
    Assertions.assertEquals("320.659491213", resp.get(0).getWeightedElevation());
  }

  void getLatLongElevation_oracleEmptyTest() {
    //
  }
}
