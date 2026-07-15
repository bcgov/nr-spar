package ca.bc.gov.backendstartapi.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDtoClassB;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

class SeedlotFormCollectionBclassMapperTest {

  private SeedlotFormCollectionBclassMapper mapper;

  @BeforeEach
  void setUp() {
    mapper = Mappers.getMapper(SeedlotFormCollectionBclassMapper.class);
  }

  @Test
  @DisplayName("toDto maps renamed entity fields and geometry geoJson")
  void toDto_mapsRenamedFields() {
    Seedlot seedlot = sampleSeedlot();
    String geoJson = "{\"type\":\"Polygon\",\"coordinates\":[]}";

    SeedlotFormCollectionDtoClassB dto = mapper.toDto(seedlot, geoJson, List.of(1, 2));

    assertThat(dto.collectionClientNumber()).isEqualTo("00012797");
    assertThat(dto.coneCollectionMethodCodes()).containsExactly(1, 2);
    assertThat(dto.collectionLocnCode()).isEqualTo("02");
    assertThat(dto.collectionStartDate()).isEqualTo(LocalDate.of(2024, 5, 1));
    assertThat(dto.noOfContainers()).isEqualByComparingTo(new BigDecimal("10"));
    assertThat(dto.volPerContainer()).isEqualByComparingTo(new BigDecimal("2.5"));
    assertThat(dto.clctnVolume()).isEqualByComparingTo(new BigDecimal("25"));
    assertThat(dto.seedlotComment()).isEqualTo("South slope");
    assertThat(dto.collectionLocationDesc()).isEqualTo("South ridge");
    assertThat(dto.bgcZoneCode()).isEqualTo("CDF");
    assertThat(dto.collectionElevation()).isEqualTo(800);
    assertThat(dto.collectionElevationMin()).isEqualTo(600);
    assertThat(dto.collectionElevationMax()).isEqualTo(1000);
    assertThat(dto.collectionGeometryGeoJson()).isEqualTo(geoJson);
  }

  @Test
  @DisplayName("applyToSeedlot maps renamed dto fields onto an existing seedlot")
  void applyToSeedlot_mapsRenamedFields() {
    Seedlot seedlot = new Seedlot("12345");
    SeedlotFormCollectionDtoClassB dto = sampleDto();

    mapper.applyToSeedlot(dto, seedlot);

    assertThat(seedlot.getCollectionClientNumber()).isEqualTo("00012797");
    assertThat(seedlot.getCollectionLocationCode()).isEqualTo("02");
    assertThat(seedlot.getCollectionStartDate()).isEqualTo(LocalDate.of(2024, 5, 1));
    assertThat(seedlot.getCollectionEndDate()).isEqualTo(LocalDate.of(2024, 5, 15));
    assertThat(seedlot.getNumberOfContainers()).isEqualByComparingTo(new BigDecimal("10"));
    assertThat(seedlot.getContainerVolume()).isEqualByComparingTo(new BigDecimal("2.5"));
    assertThat(seedlot.getTotalConeVolume()).isEqualByComparingTo(new BigDecimal("25"));
    assertThat(seedlot.getComment()).isEqualTo("South slope");
    assertThat(seedlot.getCollectionLocationDesc()).isEqualTo("South ridge");
    assertThat(seedlot.getOrgUnitNo()).isEqualTo(73);
    assertThat(seedlot.getCaptureMethodCode()).isEqualTo("CLIMB");
    assertThat(seedlot.getBgcZoneCode()).isEqualTo("CDF");
    assertThat(seedlot.getCollectionElevationMin()).isEqualTo(600);
    assertThat(seedlot.getCollectionElevationMax()).isEqualTo(1000);
    assertThat(seedlot.getAreaOfUseComment()).isEqualTo("South-facing slope");
  }

  @Test
  @DisplayName("applyToSeedlot skips date setters when values are unchanged")
  void applyToSeedlot_skipsUnchangedDates() {
    Seedlot seedlot = sampleSeedlot();
    LocalDate originalStart = seedlot.getCollectionStartDate();
    LocalDate originalEnd = seedlot.getCollectionEndDate();

    SeedlotFormCollectionDtoClassB dto =
        new SeedlotFormCollectionDtoClassB(
            "00012797",
            "02",
            originalStart,
            originalEnd,
            new BigDecimal("99"),
            new BigDecimal("9.9"),
            new BigDecimal("99.9"),
            "Updated comment",
            List.of(1, 2),
            "South ridge",
            73,
            "Y",
            new BigDecimal("500"),
            "CLIMB",
            "M",
            "Y",
            "001",
            "Y",
            "N",
            null,
            "GT5",
            "N",
            "N",
            42,
            49,
            30,
            0,
            123,
            0,
            0,
            800,
            600,
            1000,
            600,
            1000,
            49,
            0,
            50,
            0,
            122,
            0,
            124,
            0,
            0,
            0,
            0,
            0,
            "South-facing slope",
            'N',
            'W',
            "CDF",
            "Coastal Douglas-fir",
            "mm",
            '1',
            12,
            null);

    mapper.applyToSeedlot(dto, seedlot);

    assertThat(seedlot.getCollectionStartDate()).isSameAs(originalStart);
    assertThat(seedlot.getCollectionEndDate()).isSameAs(originalEnd);
    assertThat(seedlot.getComment()).isEqualTo("Updated comment");
  }

  private static Seedlot sampleSeedlot() {
    Seedlot seedlot = new Seedlot("12345");
    seedlot.setCollectionClientNumber("00012797");
    seedlot.setCollectionLocationCode("02");
    seedlot.setCollectionStartDate(LocalDate.of(2024, 5, 1));
    seedlot.setCollectionEndDate(LocalDate.of(2024, 5, 15));
    seedlot.setNumberOfContainers(new BigDecimal("10"));
    seedlot.setContainerVolume(new BigDecimal("2.5"));
    seedlot.setTotalConeVolume(new BigDecimal("25"));
    seedlot.setComment("South slope");
    seedlot.setCollectionLocationDesc("South ridge");
    seedlot.setOrgUnitNo(73);
    seedlot.setCollectionElevation(800);
    seedlot.setCollectionElevationMin(600);
    seedlot.setCollectionElevationMax(1000);
    seedlot.setBgcZoneCode("CDF");
    seedlot.setAreaOfUseComment("South-facing slope");
    return seedlot;
  }

  private static SeedlotFormCollectionDtoClassB sampleDto() {
    return new SeedlotFormCollectionDtoClassB(
        "00012797",
        "02",
        LocalDate.of(2024, 5, 1),
        LocalDate.of(2024, 5, 15),
        new BigDecimal("10"),
        new BigDecimal("2.5"),
        new BigDecimal("25"),
        "South slope",
        List.of(1, 2),
        "South ridge",
        73,
        "Y",
        new BigDecimal("500"),
        "CLIMB",
        "M",
        "Y",
        "001",
        "Y",
        "N",
        null,
        "GT5",
        "N",
        "N",
        42,
        49,
        30,
        0,
        123,
        0,
        0,
        800,
        600,
        1000,
        600,
        1000,
        49,
        0,
        50,
        0,
        122,
        0,
        124,
        0,
        0,
        0,
        0,
        0,
        "South-facing slope",
        'N',
        'W',
        "CDF",
        "Coastal Douglas-fir",
        "mm",
        '1',
        12,
        null);
  }
}
