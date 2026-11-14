package ca.bc.gov.backendstartapi.report.html;

import static org.assertj.core.api.Assertions.assertThat;

import ca.bc.gov.backendstartapi.report.Sprr001MainRow;
import ca.bc.gov.backendstartapi.report.Sprr001OwnershipRow;
import ca.bc.gov.backendstartapi.report.Sprr001ReportData;
import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class Sprr001HtmlModelTest {

  private static final ZonedDateTime PRINTED =
      ZonedDateTime.of(2026, 11, 9, 14, 5, 0, 0, ZoneId.of("America/Vancouver"));

  @Test
  @DisplayName("formats coordinates, numbers and agency names like the Jasper expressions")
  void from_formatsLikeJasper() {
    Sprr001HtmlModel m =
        Sprr001HtmlModel.from(Sprr001HtmlSamples.classB(), "63001", "JSMITH", PRINTED, "");

    assertThat(m.getCollectionLatitude()).isEqualTo("49° 05' 07\"");
    assertThat(m.getCollectionLongitude()).isEqualTo("125° 30' 00\"");
    assertThat(m.getElevationMeanMinMax()).isEqualTo("450 / 300 / 600");
    assertThat(m.getRadiusOfCollectionArea()).isEqualTo("2.50");
    assertThat(m.getVolPerContainer()).isEqualTo("1.50");
    assertThat(m.getNoOfContainers()).isEqualTo("12.0");
    assertThat(m.getBecZoneSubzoneVariant()).isEqualTo("CWH / xm / 2");
    assertThat(m.getApplicantAgency()).isEqualTo("WFP 00 WESTERN FOREST PRODUCTS INC.");
    assertThat(m.getExtractoryAgency()).isEqualTo("TSC  00  TREE SEED CENTRE");
    assertThat(m.getPrintedAt()).isEqualTo("2026-11-09 14:05:00 PM");
    assertThat(m.isClassA()).isFalse();
    assertThat(m.isDeclared()).isTrue();
    assertThat(m.getOwnershipLines())
        .singleElement()
        .satisfies(
            o -> {
              assertThat(o.getAgency()).isEqualTo("WFP 00");
              assertThat(o.getOwnerPortion()).isEqualTo("100.0");
              assertThat(o.getFundingSource()).isEqualTo("Industry Tree Coverage");
            });
  }

  @Test
  @DisplayName("applies the legacy defaults and suppression rules when values are missing")
  void from_appliesDefaults() {
    Sprr001OwnershipRow noAcronym = new Sprr001OwnershipRow();
    noAcronym.setOwnerPortionPct(BigDecimal.TEN);
    Sprr001ReportData data = new Sprr001ReportData(new Sprr001MainRow(), List.of(noAcronym));

    Sprr001HtmlModel m = Sprr001HtmlModel.from(data, "63001", "JSMITH", PRINTED, "");

    assertThat(m.getStorageFacilityType())
        .isEqualTo(Sprr001HtmlModel.DEFAULT_STORAGE_FACILITY_TYPE);
    assertThat(m.getTreesCollectedFrom()).isEqualTo(Sprr001HtmlModel.DEFAULT_TREES_COLLECTED_FROM);
    assertThat(m.getCollectionLatitude()).isEmpty();
    assertThat(m.getBecZoneSubzoneVariant()).isEmpty();
    assertThat(m.getApplicantAgency()).isEmpty();
    assertThat(m.getMinElevation()).isEmpty();
    assertThat(m.isDeclared()).isFalse();
    assertThat(m.getOwnershipLines()).isEmpty();
  }
}
