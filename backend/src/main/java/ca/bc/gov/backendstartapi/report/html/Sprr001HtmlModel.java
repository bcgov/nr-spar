package ca.bc.gov.backendstartapi.report.html;

import ca.bc.gov.backendstartapi.report.Sprr001MainRow;
import ca.bc.gov.backendstartapi.report.Sprr001OwnershipRow;
import ca.bc.gov.backendstartapi.report.Sprr001ReportData;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.Builder;
import lombok.Value;

/**
 * View model for the HTML/Thymeleaf version of SPRR001.
 *
 * <p>Every calculation the Jasper template did in JRXML variables and expressions (degree/minute/
 * second formatting, number patterns, defaults, agency name concatenation) is done here in Java so
 * the template only places values. Raw fields are still reachable through {@link #getRow()}.
 */
@Value
@Builder
public class Sprr001HtmlModel {

  static final String DEFAULT_STORAGE_FACILITY_TYPE = "RFR OTH CVR VEN";
  static final String DEFAULT_TREES_COLLECTED_FROM = "<10 ___  11-50 ___  50+ ___";
  static final String DECIMAL_FORMAT = "#,##0.0;-#,##0.0";
  static final String NUMBER_FORMAT = "#,##0;-#,##0";

  private static final DateTimeFormatter PRINTED_AT =
      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss a", Locale.US);

  Sprr001MainRow row;
  String seedlotNumber;
  String userId;
  String printedAt;
  String logoDataUri;

  boolean classA;

  String applicantAgency;
  String effectivePopSize;
  String collectionLatitude;
  String collectionLongitude;
  String meanElevation;
  String elevationMeanMinMax;
  String radiusOfCollectionArea;
  String becZoneSubzoneVariant;
  String noOfContainers;
  String volPerContainer;
  String clctnVolume;
  String treesCollectedFrom;
  String coneCollectorAgency;

  String minElevation;
  String maxElevation;
  String minLatitude;
  String maxLatitude;
  String minLongitude;
  String maxLongitude;

  String interimAgency;
  String storageFacilityType;
  String extractoryAgency;
  String seedStorageAgency;

  boolean declared;

  List<OwnershipLine> ownershipLines;

  /** One printed ownership row; Jasper's ownership subreport band. */
  @Value
  public static class OwnershipLine {
    String agency;
    String ownerPortion;
    String reserved;
    String surplus;
    String fundingSource;
    String methodOfPayment;
  }

  /**
   * Build the view model from the same assembled data the Jasper report uses.
   *
   * @param data assembled SPRR001 rows
   * @param seedlotNumber seedlot being printed
   * @param userId IDIR/BCeID shown in the header
   * @param printedAt timestamp shown in the header
   * @param logoDataUri {@code data:} URI for the BC logo, or empty
   * @return the model
   */
  public static Sprr001HtmlModel from(
      Sprr001ReportData data,
      String seedlotNumber,
      String userId,
      ZonedDateTime printedAt,
      String logoDataUri) {
    Sprr001MainRow r = data.mainRow();
    return Sprr001HtmlModel.builder()
        .row(r)
        .seedlotNumber(seedlotNumber)
        .userId(userId)
        .printedAt(PRINTED_AT.format(printedAt))
        .logoDataUri(logoDataUri)
        .classA("A".equalsIgnoreCase(r.getGeneticClass()))
        .applicantAgency(
            join(" ", r.getClientAcronym(), r.getApplicantClientLocn(), r.getClientName()))
        .effectivePopSize(format(DECIMAL_FORMAT, r.getEffectivePopSize()))
        .collectionLatitude(
            dms(r.getCollectionLatDeg(), r.getCollectionLatMin(), r.getCollectionLatSec(), 2))
        .collectionLongitude(
            dms(r.getCollectionLongDeg(), r.getCollectionLongMin(), r.getCollectionLongSec(), 3))
        .meanElevation(format(NUMBER_FORMAT, r.getCollectionElevation()))
        .elevationMeanMinMax(
            Stream.of(
                    r.getCollectionElevation(),
                    r.getCollectionElevationMin(),
                    r.getCollectionElevationMax())
                .map(v -> format("0;-0", v))
                .collect(Collectors.joining(" / ")))
        .radiusOfCollectionArea(format("###0.00", r.getRadiusOfCollectionArea()))
        .becZoneSubzoneVariant(bec(r))
        .noOfContainers(format(DECIMAL_FORMAT, r.getNoOfContainers()))
        .volPerContainer(format("#,###.00;-#,###.00", r.getVolPerContainer()))
        .clctnVolume(format("#,##0.00;-#,##0.00", r.getClctnVolume()))
        .treesCollectedFrom(
            r.getNmbrTreesFromCode() == null
                ? DEFAULT_TREES_COLLECTED_FROM
                : Objects.toString(r.getNmbrTreesFromDesc(), ""))
        .coneCollectorAgency(
            join(
                "    ",
                join(" ", r.getCollectionClientAcronym(), r.getCollectionCliLocnCd()),
                r.getCollectionClientName()))
        .minElevation(format("0;-0", r.getMinElevation()))
        .maxElevation(format("0;-0", r.getMaxElevation()))
        .minLatitude(
            dms(r.getMinLatitudeDeg(), r.getMinLatitudeMinutes(), r.getMinLatitudeSec(), 2))
        .maxLatitude(dms(r.getMaxLatitudeDeg(), r.getMaxLatitudeMin(), r.getMaxLatitudeSec(), 2))
        .minLongitude(
            dms(r.getMinLongitudeDeg(), r.getMinLongitudeMinutes(), r.getMinLongitudeSec(), 3))
        .maxLongitude(
            dms(r.getMaxLongitudeDeg(), r.getMaxLongitudeMin(), r.getMaxLongitudeSec(), 3))
        .interimAgency(
            join(
                "  ",
                r.getInterimAgencyAcronym(),
                r.getIntermAgenctLocn(),
                r.getInterimAgencyName()))
        .storageFacilityType(
            r.getStorageFacilityType() == null
                ? DEFAULT_STORAGE_FACILITY_TYPE
                : r.getStorageFacilityType())
        .extractoryAgency(
            join(
                "  ",
                r.getExtractoryAgencyAcronym(),
                r.getExtrctCliLocnCd(),
                r.getExtractoryAgencyName()))
        .seedStorageAgency(
            join(
                "  ",
                r.getSeedAgencyAcronym(),
                r.getSeedStoreClientLocn(),
                r.getSeedAgencyClientName()))
        .declared(r.getDeclaration() != null)
        .ownershipLines(
            data.ownershipRows().stream()
                // Jasper suppresses ownership rows with no client acronym (CCF0_FRM_SUPPRESS).
                .filter(o -> o.getClientAcronym() != null)
                .map(Sprr001HtmlModel::ownershipLine)
                .toList())
        .build();
  }

  private static OwnershipLine ownershipLine(Sprr001OwnershipRow o) {
    return new OwnershipLine(
        join(" ", o.getClientAcronym(), o.getClientLocnCode()),
        format(DECIMAL_FORMAT, o.getOwnerPortionPct()),
        format(NUMBER_FORMAT, o.getReservedPct()),
        format(NUMBER_FORMAT, o.getSurplusPct()),
        o.getFundingSource() == null ? "" : Objects.toString(o.getSparFundSrceDesc(), ""),
        o.getMethodOfPaymentCode() == null ? "" : Objects.toString(o.getMethodOfPaymentDesc(), ""));
  }

  private static String bec(Sprr001MainRow r) {
    if (r.getBgcZoneCode() == null || r.getBgcSubzoneCode() == null) {
      return "";
    }
    return r.getBgcZoneCode()
        + " / "
        + r.getBgcSubzoneCode()
        + " / "
        + Objects.toString(r.getVariant(), "");
  }

  /**
   * Degrees, minutes and seconds as the legacy report prints them, e.g. {@code 49° 05' 07"}.
   *
   * @param degreeDigits 2 for latitude, 3 for longitude
   */
  static String dms(BigDecimal deg, BigDecimal min, BigDecimal sec, int degreeDigits) {
    if (deg == null) {
      return "";
    }
    return pad(deg, degreeDigits) + "° " + pad(min, 2) + "' " + pad(sec, 2) + "\"";
  }

  private static String pad(BigDecimal value, int digits) {
    int v = value == null ? 0 : value.intValue();
    return String.format("%0" + digits + "d", v);
  }

  static String format(String pattern, BigDecimal value) {
    if (value == null) {
      return "";
    }
    return new DecimalFormat(pattern, DecimalFormatSymbols.getInstance(Locale.CANADA))
        .format(value);
  }

  private static String join(String separator, String... parts) {
    return Stream.of(parts)
        .filter(p -> p != null && !p.isBlank())
        .collect(Collectors.joining(separator));
  }
}
