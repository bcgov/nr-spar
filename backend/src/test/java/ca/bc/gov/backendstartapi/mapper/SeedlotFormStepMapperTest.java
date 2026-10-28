package ca.bc.gov.backendstartapi.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import ca.bc.gov.backendstartapi.dto.SeedlotFormExtractionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormInterimDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOwnershipDto;
import ca.bc.gov.backendstartapi.entity.MethodOfPaymentEntity;
import ca.bc.gov.backendstartapi.entity.embeddable.EffectiveDateRange;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.entity.seedlot.SeedlotOwnerQuantity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

class SeedlotFormStepMapperTest {

  private static final EffectiveDateRange DATE_RANGE =
      new EffectiveDateRange(LocalDate.now().minusDays(1), LocalDate.now().plusYears(1));

  private SeedlotFormStepMapper mapper;

  @BeforeEach
  void setUp() {
    mapper = Mappers.getMapper(SeedlotFormStepMapper.class);
  }

  @Test
  @DisplayName("toInterimDto maps renamed interim storage fields")
  void toInterimDto_mapsRenamedFields() {
    Seedlot seedlot = new Seedlot("53001");
    seedlot.setInterimStorageClientNumber("00012797");
    seedlot.setInterimStorageLocationCode("01");
    seedlot.setInterimStorageStartDate(LocalDate.of(2023, Month.DECEMBER, 20));
    seedlot.setInterimStorageEndDate(LocalDate.of(2023, Month.DECEMBER, 21));
    seedlot.setInterimStorageOtherFacilityDesc("Mini fridge");
    seedlot.setInterimStorageFacilityCode("OCV");

    SeedlotFormInterimDto dto = mapper.toInterimDto(seedlot);

    assertThat(dto.intermStrgClientNumber()).isEqualTo("00012797");
    assertThat(dto.intermStrgLocnCode()).isEqualTo("01");
    assertThat(dto.intermStrgStDate()).isEqualTo(LocalDate.of(2023, Month.DECEMBER, 20));
    assertThat(dto.intermStrgEndDate()).isEqualTo(LocalDate.of(2023, Month.DECEMBER, 21));
    assertThat(dto.intermOtherFacilityDesc()).isEqualTo("Mini fridge");
    assertThat(dto.intermFacilityCode()).isEqualTo("OCV");
  }

  @Test
  @DisplayName("toExtractionDto maps renamed extraction and storage fields")
  void toExtractionDto_mapsRenamedFields() {
    Seedlot seedlot = new Seedlot("53001");
    seedlot.setExtractionClientNumber("00012797");
    seedlot.setExtractionLocationCode("01");
    seedlot.setExtractionStartDate(LocalDate.of(2023, Month.NOVEMBER, 23));
    seedlot.setExtractionEndDate(LocalDate.of(2023, Month.NOVEMBER, 24));
    seedlot.setStorageClientNumber("00012798");
    seedlot.setStorageLocationCode("02");
    seedlot.setTemporaryStorageStartDate(LocalDate.of(2023, Month.NOVEMBER, 25));
    seedlot.setTemporaryStorageEndDate(LocalDate.of(2023, Month.NOVEMBER, 26));

    SeedlotFormExtractionDto dto = mapper.toExtractionDto(seedlot);

    assertThat(dto.extractoryClientNumber()).isEqualTo("00012797");
    assertThat(dto.extractoryLocnCode()).isEqualTo("01");
    assertThat(dto.extractionStDate()).isEqualTo(LocalDate.of(2023, Month.NOVEMBER, 23));
    assertThat(dto.extractionEndDate()).isEqualTo(LocalDate.of(2023, Month.NOVEMBER, 24));
    assertThat(dto.storageClientNumber()).isEqualTo("00012798");
    assertThat(dto.storageLocnCode()).isEqualTo("02");
    assertThat(dto.temporaryStrgStartDate()).isEqualTo(LocalDate.of(2023, Month.NOVEMBER, 25));
    assertThat(dto.temporaryStrgEndDate()).isEqualTo(LocalDate.of(2023, Month.NOVEMBER, 26));
  }

  @Test
  @DisplayName("toOwnershipDto maps renamed owner quantity fields")
  void toOwnershipDto_mapsRenamedFields() {
    Seedlot seedlot = new Seedlot("53001");
    MethodOfPaymentEntity payment = new MethodOfPaymentEntity("CLA", "Client account", DATE_RANGE);
    SeedlotOwnerQuantity owner = new SeedlotOwnerQuantity(seedlot, "00012797", "02", payment);
    owner.setOriginalPercentageOwned(new BigDecimal("100"));
    owner.setOriginalPercentageReserved(new BigDecimal("90"));
    owner.setOriginalPercentageSurplus(new BigDecimal("10"));
    owner.setFundingSourceCode("ITC");

    SeedlotFormOwnershipDto dto = mapper.toOwnershipDto(owner);

    assertThat(dto.ownerClientNumber()).isEqualTo("00012797");
    assertThat(dto.ownerLocnCode()).isEqualTo("02");
    assertThat(dto.originalPctOwned()).isEqualByComparingTo(new BigDecimal("100"));
    assertThat(dto.originalPctRsrvd()).isEqualByComparingTo(new BigDecimal("90"));
    assertThat(dto.originalPctSrpls()).isEqualByComparingTo(new BigDecimal("10"));
    assertThat(dto.methodOfPaymentCode()).isEqualTo("CLA");
    assertThat(dto.sparFundSrceCode()).isEqualTo("ITC");
  }
}
