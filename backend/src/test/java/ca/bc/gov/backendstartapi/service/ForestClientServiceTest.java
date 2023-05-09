package ca.bc.gov.backendstartapi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrowsExactly;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.BDDMockito.given;

import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.enums.ForestClientStatusEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientTypeEnum;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@SpringBootTest
class ForestClientServiceTest {

  @MockBean private RestTemplate restTemplate;

  private ForestClientService forestClientService;

  @BeforeEach
  void setup() {
    var provider = new ForestClientApiProvider(restTemplate);
    forestClientService = new ForestClientService(provider);
  }

  @Test
  void fetchExistentClientByNumber() {
    var client =
        new ForestClientDto(
            "00000000",
            "SMITH",
            "JOHN",
            "JOSEPH",
            ForestClientStatusEnum.ACT,
            ForestClientTypeEnum.I,
            "JSMITH");

    given(restTemplate.getForEntity("/clients/findByClientNumber/00000000", ForestClientDto.class))
        .willReturn(ResponseEntity.ok(client));

    var fetchResult = forestClientService.fetchClient("00000000");

    assertTrue(fetchResult.isPresent());
    assertEquals(client, fetchResult.get());
  }

  @Test
  void fetchInexistentClientByNumber() {
    var client =
        new ForestClientDto(
            "00000000",
            "SMITH",
            "JOHN",
            "JOSEPH",
            ForestClientStatusEnum.ACT,
            ForestClientTypeEnum.I,
            "JSMITH");

    given(restTemplate.getForEntity("/clients/findByClientNumber/00000000", ForestClientDto.class))
        .willReturn(ResponseEntity.ok(client));
    given(restTemplate.getForEntity("/clients/findByClientNumber/00000001", ForestClientDto.class))
        .willThrow(
            HttpClientErrorException.create(
                HttpStatus.NOT_FOUND,
                "Not Found",
                HttpHeaders.EMPTY,
                "Client 00000001 not found.".getBytes(StandardCharsets.UTF_8),
                null));

    var fetchResult = forestClientService.fetchClient("00000001");

    assertTrue(fetchResult.isEmpty());
  }

  @Test
  void fetchExistentClientByAcronym() {
    var client =
        new ForestClientDto(
            "00000000",
            "SMITH",
            "JOHN",
            "JOSEPH",
            ForestClientStatusEnum.ACT,
            ForestClientTypeEnum.I,
            "JSMITH");

    given(
            restTemplate.exchange(
                "/clients/findByAcronym?acronym=JSMITH",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<ForestClientDto>>() {}))
        .willReturn(ResponseEntity.ok(List.of(client)));

    var fetchResult = forestClientService.fetchClient("JSMITH");

    assertTrue(fetchResult.isPresent());
    assertEquals(client, fetchResult.get());
  }

  @Test
  void fetchInexistentClientByAcronym() {
    var client =
        new ForestClientDto(
            "00000000",
            "SMITH",
            "JOHN",
            "JOSEPH",
            ForestClientStatusEnum.ACT,
            ForestClientTypeEnum.I,
            "JSMITH");

    given(
            restTemplate.exchange(
                "/clients/findByAcronym?acronym=JSMITH",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<ForestClientDto>>() {}))
        .willReturn(ResponseEntity.ok(List.of(client)));
    given(
            restTemplate.exchange(
                "/clients/findByAcronym?acronym=JDOE",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<ForestClientDto>>() {}))
        .willReturn(ResponseEntity.ok(List.of()));

    var fetchResult = forestClientService.fetchClient("JDOE");

    assertTrue(fetchResult.isEmpty());
  }

  @Test
  void nonConformingIdentifier() {
    var client =
        new ForestClientDto(
            "00000000",
            "SMITH",
            "JOHN",
            "JOSEPH",
            ForestClientStatusEnum.ACT,
            ForestClientTypeEnum.I,
            "JSMITH");

    given(restTemplate.getForEntity("/clients/findByClientNumber/00000000", ForestClientDto.class))
        .willReturn(ResponseEntity.ok(client));
    given(
            restTemplate.exchange(
                "/clients/findByAcronym?acronym=JSMITH",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<ForestClientDto>>() {}))
        .willReturn(ResponseEntity.ok(List.of(client)));

    assertThrowsExactly(
        IllegalArgumentException.class, () -> forestClientService.fetchClient("b4d-1d*Nt1f13R"));
  }
}
