package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.dto.CaculatedParentTreeValsDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRespondDto;
import ca.bc.gov.backendstartapi.dto.PtCalculationResDto;
import ca.bc.gov.backendstartapi.service.ParentTreeService;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ParentTreeEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class ParentTreeEndpointTest {

  @Autowired MockMvc mockMvc;

  @MockBean ParentTreeService parentTreeService;

  @Test
  @DisplayName("calcMeanGeospatialSuccessTest")
  void calcMeanGeospatialSuccessTest() throws Exception {
    /* ********* RESPONSE DATA ********* */
    CaculatedParentTreeValsDto cacledPtValsDto = new CaculatedParentTreeValsDto();
    BigDecimal neValue = new BigDecimal("4.92586");
    cacledPtValsDto.setNeValue(neValue);
    GeospatialRespondDto geoResDto = new GeospatialRespondDto();
    geoResDto.setMeanElevation(120);
    geoResDto.setMeanLatitude(new BigDecimal(55.23156));
    geoResDto.setMeanLatitudeDegree(55);
    geoResDto.setMeanLatitudeMinute(13);
    geoResDto.setMeanLatitudeSecond(54);
    geoResDto.setMeanLongitude(new BigDecimal(128.55321));
    geoResDto.setMeanLongitudeDegree(128);
    geoResDto.setMeanLongitudeMinute(33);
    geoResDto.setMeanLongitudeSecond(12);
    cacledPtValsDto.setGeospatialData(geoResDto);

    GeospatialRespondDto smpMixMeanDto = new GeospatialRespondDto();
    smpMixMeanDto.setMeanElevation(118);
    smpMixMeanDto.setMeanLatitude(new BigDecimal(58.12356));
    smpMixMeanDto.setMeanLatitudeDegree(58);
    smpMixMeanDto.setMeanLatitudeMinute(7);
    smpMixMeanDto.setMeanLatitudeSecond(25);
    smpMixMeanDto.setMeanLongitude(new BigDecimal(131.23111));
    smpMixMeanDto.setMeanLongitudeDegree(131);
    smpMixMeanDto.setMeanLongitudeMinute(13);
    smpMixMeanDto.setMeanLongitudeSecond(52);

    List<GeneticWorthTraitsDto> genWorthResDrto =
        List.of(
            new GeneticWorthTraitsDto(
                "GVO", new BigDecimal("17"), new BigDecimal("55"), new BigDecimal("67")),
            new GeneticWorthTraitsDto(
                "WWD", new BigDecimal("2"), new BigDecimal("32"), new BigDecimal("14")));

    PtCalculationResDto responseDto =
        new PtCalculationResDto(genWorthResDrto, cacledPtValsDto, smpMixMeanDto);

    when(parentTreeService.calculatePtVals(any())).thenReturn(responseDto);

    String reqJson =
        """
          {
            "orchardPtVals": [
              {
                "parentTreeId": "4423",
                "parentTreeNumber": "4423",
                "coneCount": 13,
                "pollenCount": 48.5,
                "smpSuccessPerc": 5,
                "geneticTraits": [
                  {
                    "traitCode": "gvo",
                    "traitValue": 11.2
                  }
                ]
              },
              {
                "parentTreeId": "32",
                "parentTreeNumber": "356",
                "coneCount": 51,
                "pollenCount": 21,
                "smpSuccessPerc": 21,
                "geneticTraits": [
                  {
                    "traitCode": "gvo",
                    "traitValue": 11.2
                  }
                ]
              }
            ],
            "smpMixIdAndProps": [
              {
                "parentTreeId": 12,
                "proportion": 10
              },
              {
                "parentTreeId": 22,
                "proportion": 90
              }
            ]
          }
        """;

    mockMvc
        .perform(
            post("/api/parent-trees/calculate")
                .with(csrf().asHeader())
                .content(reqJson)
                .contentType(MediaType.APPLICATION_JSON)
                // .header("Content-Type", "application/json")
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        /* ********** CALCULATED GENETIC WORTH VALUES ********** */
        .andExpect(
            jsonPath("$.geneticTraits[0].traitCode")
                .value(responseDto.geneticTraits().get(0).traitCode()))
        .andExpect(
            jsonPath("$.geneticTraits[0].calculatedValue")
                .value(responseDto.geneticTraits().get(0).calculatedValue().toString()))
        .andExpect(
            jsonPath("$.geneticTraits[0].testedParentTreePerc")
                .value(responseDto.geneticTraits().get(0).testedParentTreePerc().toString()))
        /* ********** CALCULATED PARENT TREE VALUES ********** */
        .andExpect(
            jsonPath("$.calculatedPtVals.neValue")
                .value(responseDto.calculatedPtVals().getNeValue().toString()))
        .andExpect(
            jsonPath("$.calculatedPtVals.geospatialData.meanLatitudeDegree")
                .value(responseDto.calculatedPtVals().getGeospatialData().getMeanLatitudeDegree()))
        .andExpect(
            jsonPath("$.calculatedPtVals.geospatialData.meanLatitudeMinute")
                .value(responseDto.calculatedPtVals().getGeospatialData().getMeanLatitudeMinute()))
        .andExpect(
            jsonPath("$.calculatedPtVals.geospatialData.meanLatitudeSecond")
                .value(responseDto.calculatedPtVals().getGeospatialData().getMeanLatitudeSecond()))
        .andExpect(
            jsonPath("$.calculatedPtVals.geospatialData.meanLongitudeDegree")
                .value(responseDto.calculatedPtVals().getGeospatialData().getMeanLongitudeDegree()))
        .andExpect(
            jsonPath("$.calculatedPtVals.geospatialData.meanLongitudeMinute")
                .value(responseDto.calculatedPtVals().getGeospatialData().getMeanLongitudeMinute()))
        .andExpect(
            jsonPath("$.calculatedPtVals.geospatialData.meanLongitudeSecond")
                .value(responseDto.calculatedPtVals().getGeospatialData().getMeanLongitudeSecond()))
        .andExpect(
            jsonPath("$.calculatedPtVals.geospatialData.meanLatitude")
                .value(
                    responseDto
                        .calculatedPtVals()
                        .getGeospatialData()
                        .getMeanLatitude()
                        .toString()))
        .andExpect(
            jsonPath("$.calculatedPtVals.geospatialData.meanLongitude")
                .value(
                    responseDto
                        .calculatedPtVals()
                        .getGeospatialData()
                        .getMeanLongitude()
                        .toString()))
        .andExpect(
            jsonPath("$.calculatedPtVals.geospatialData.meanElevation")
                .value(
                    responseDto
                        .calculatedPtVals()
                        .getGeospatialData()
                        .getMeanElevation()
                        .toString()))
        /* ********** SMP MIX MEAN GEOSPATIAL DATA ********** */
        .andExpect(
            jsonPath("$.smpMixMeanGeoData.meanLatitudeDegree")
                .value(responseDto.smpMixMeanGeoData().getMeanLatitudeDegree()))
        .andExpect(
            jsonPath("$.smpMixMeanGeoData.meanLatitudeMinute")
                .value(responseDto.smpMixMeanGeoData().getMeanLatitudeMinute()))
        .andExpect(
            jsonPath("$.smpMixMeanGeoData.meanLatitudeSecond")
                .value(responseDto.smpMixMeanGeoData().getMeanLatitudeSecond()))
        .andExpect(
            jsonPath("$.smpMixMeanGeoData.meanLongitudeDegree")
                .value(responseDto.smpMixMeanGeoData().getMeanLongitudeDegree()))
        .andExpect(
            jsonPath("$.smpMixMeanGeoData.meanLongitudeMinute")
                .value(responseDto.smpMixMeanGeoData().getMeanLongitudeMinute()))
        .andExpect(
            jsonPath("$.smpMixMeanGeoData.meanLongitudeSecond")
                .value(responseDto.smpMixMeanGeoData().getMeanLongitudeSecond()))
        .andExpect(
            jsonPath("$.smpMixMeanGeoData.meanLatitude")
                .value(responseDto.smpMixMeanGeoData().getMeanLatitude().toString()))
        .andExpect(
            jsonPath("$.smpMixMeanGeoData.meanLongitude")
                .value(responseDto.smpMixMeanGeoData().getMeanLongitude().toString()))
        .andExpect(
            jsonPath("$.smpMixMeanGeoData.meanElevation")
                .value(responseDto.smpMixMeanGeoData().getMeanElevation()))
        .andReturn();
  }

  @Test
  @DisplayName("Missing request property error test")
  void calcMeanGeospatial__noSmpMixField_error_test() throws Exception {
    String reqJson =
        """
          {
            "orchardPtVals": [
              {
                "parentTreeId": "4423",
                "parentTreeNumber": "4423",
                "coneCount": 13,
                "pollenCount": 48.5,
                "smpSuccessPerc": 5,
                "geneticTraits": [
                  {
                    "traitCode": "gvo",
                    "traitValue": 11.2
                  }
                ]
              },
              {
                "parentTreeId": "32",
                "parentTreeNumber": "356",
                "coneCount": 51,
                "pollenCount": 21,
                "smpSuccessPerc": 21,
                "geneticTraits": [
                  {
                    "traitCode": "gvo",
                    "traitValue": 11.2
                  }
                ]
              }
            ]
          }
        """;

    mockMvc
        .perform(
            post("/api/parent-trees/calculate")
                .with(csrf().asHeader())
                .content(reqJson)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isBadRequest())
        .andReturn();
  }
}
