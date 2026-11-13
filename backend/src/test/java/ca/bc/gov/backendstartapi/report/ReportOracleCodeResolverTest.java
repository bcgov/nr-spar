package ca.bc.gov.backendstartapi.report;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.oracle.OrgUnitDistrictDto;
import ca.bc.gov.backendstartapi.provider.Provider;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(SpringExtension.class)
class ReportOracleCodeResolverTest {

  @Mock private Provider oracleApiProvider;

  private ReportOracleCodeResolver resolver;

  @BeforeEach
  void setup() {
    resolver = new ReportOracleCodeResolver(oracleApiProvider);
  }

  @Test
  @DisplayName("lookups return oracle descriptions")
  void lookups_returnDescriptions() {
    stubLookups();

    assertThat(resolver.speciesDesc("FDI")).isEqualTo("Interior Douglas-fir");
    assertThat(resolver.orgUnitDesc(73)).isEqualTo("Cariboo-Chilcotin Natural Resource District");
    assertThat(resolver.fundingDesc("ITC")).isEqualTo("Incremental Tree Improvement");
  }

  @Test
  @DisplayName("lookups fall back to the stored code when oracle has no match")
  void lookups_missingCode_fallBackToCode() {
    when(oracleApiProvider.getVegetationCode("PLI")).thenReturn(Optional.empty());
    when(oracleApiProvider.getAllDistrictOrgUnits()).thenReturn(List.of());
    when(oracleApiProvider.getAllValidFundingSources()).thenReturn(List.of());

    assertThat(resolver.speciesDesc("PLI")).isEqualTo("PLI");
    assertThat(resolver.orgUnitDesc(99)).isEqualTo("99");
    assertThat(resolver.fundingDesc("BCT")).isEqualTo("BCT");
  }

  @Test
  @DisplayName("org-unit and funding lists are loaded once per report")
  void lookups_loadListsOnce() {
    stubLookups();

    resolver.orgUnitDesc(73);
    resolver.orgUnitDesc(73);
    resolver.fundingDesc("ITC");
    resolver.fundingDesc("ITC");

    verify(oracleApiProvider, times(1)).getAllDistrictOrgUnits();
    verify(oracleApiProvider, times(1)).getAllValidFundingSources();
  }

  @Test
  @DisplayName("a failed list lookup still prints the stored code")
  void listLookupFailure_fallsBackToCode() {
    when(oracleApiProvider.getAllDistrictOrgUnits())
        .thenThrow(new ResponseStatusException(HttpStatus.BAD_GATEWAY, "oracle down"));
    when(oracleApiProvider.getAllValidFundingSources())
        .thenThrow(new ResponseStatusException(HttpStatus.BAD_GATEWAY, "oracle down"));

    assertThat(resolver.orgUnitDesc(73)).isEqualTo("73");
    assertThat(resolver.fundingDesc("ITC")).isEqualTo("ITC");
  }

  @Test
  @DisplayName("null codes return null without calling oracle-api")
  void nullCodes_returnNull() {
    assertThat(resolver.speciesDesc(null)).isNull();
    assertThat(resolver.orgUnitDesc(null)).isNull();
    assertThat(resolver.fundingDesc(" ")).isNull();
  }

  @Test
  @DisplayName("a failed species lookup still prints the stored code")
  void speciesLookupFailure_fallsBackToCode() {
    when(oracleApiProvider.getVegetationCode("FDI"))
        .thenThrow(new ResponseStatusException(HttpStatus.BAD_GATEWAY, "oracle down"));

    assertThat(resolver.speciesDesc("FDI")).isEqualTo("FDI");
  }

  @Test
  @DisplayName("blank oracle descriptions fall back to the stored code")
  void blankDescription_fallsBackToCode() {
    when(oracleApiProvider.getVegetationCode("FDI"))
        .thenReturn(Optional.of(new CodeDescriptionDto("FDI", "  ")));
    when(oracleApiProvider.getAllDistrictOrgUnits())
        .thenReturn(
            List.of(
                new OrgUnitDistrictDto(null, "ignored"), new OrgUnitDistrictDto(73, null)));
    when(oracleApiProvider.getAllValidFundingSources())
        .thenReturn(
            List.of(
                new CodeDescriptionDto(null, "ignored"), new CodeDescriptionDto("ITC", null)));

    assertThat(resolver.speciesDesc("FDI")).isEqualTo("FDI");
    assertThat(resolver.orgUnitDesc(73)).isEqualTo("73");
    assertThat(resolver.fundingDesc("ITC")).isEqualTo("ITC");
  }

  private void stubLookups() {
    when(oracleApiProvider.getVegetationCode("FDI"))
        .thenReturn(Optional.of(new CodeDescriptionDto("FDI", "Interior Douglas-fir")));
    when(oracleApiProvider.getAllDistrictOrgUnits())
        .thenReturn(
            List.of(new OrgUnitDistrictDto(73, "Cariboo-Chilcotin Natural Resource District")));
    when(oracleApiProvider.getAllValidFundingSources())
        .thenReturn(List.of(new CodeDescriptionDto("ITC", "Incremental Tree Improvement")));
  }
}
