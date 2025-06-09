package ca.bc.gov.oracleapi.entity.consep;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class ActivityEntityTest {

  @Test
  void testAllGettersAndSetters() {
    ActivityEntity entity = new ActivityEntity();

    BigDecimal decimalVal = new BigDecimal("123.45");
    Integer intVal = 42;
    LocalDate dateVal = LocalDate.of(2024, 6, 5);
    LocalDateTime dateTimeVal = LocalDateTime.of(2024, 6, 5, 12, 34, 56);

    entity.setRiaKey(decimalVal);
    entity.setRequestId("REQ123456");
    entity.setRequestSkey(decimalVal);
    entity.setItemId("1");
    entity.setSeedlotNumber("S1234");
    entity.setFamilyLotNumber("FAMILY001");
    entity.setVegetationState("VEGST");
    entity.setStandardActivityId("STD");
    entity.setActivityTypeCode("ATC");
    entity.setTestCategoryCode("TCC");

    entity.setEarliestStartDate(dateVal);
    entity.setLatestStartDate(dateVal);
    entity.setPlannedStartDate(dateVal);
    entity.setRevisedStartDate(dateVal);
    entity.setEarliestEndDate(dateVal);
    entity.setLatestEndDate(dateVal);
    entity.setPlannedEndDate(dateVal);
    entity.setRevisedEndDate(dateVal);

    entity.setActualBeginDateTime(dateTimeVal);
    entity.setActualEndDateTime(dateTimeVal);
    entity.setActivityDuration(intVal);
    entity.setActivityTimeUnit("HRS");
    entity.setSignificantStatusIndicator(1);
    entity.setProcessCommitIndicator(1);
    entity.setUpdateTimestamp(dateTimeVal);
    entity.setProcessResultIndicator(0);
    entity.setTestResultIndicator(1);
    entity.setAssociatedRiaKey(decimalVal);
    entity.setWorkCentreId("WCI");
    entity.setBlendingMethod("BM1");
    entity.setDryerUsed("DU1");
    entity.setDeckType("DT1");
    entity.setDspMethod("DM1");

    entity.setTotalSoakHours(intVal);
    entity.setTotalSoakMinutes(intVal);
    entity.setTargetFloaters(intVal);
    entity.setTargetSinkers(intVal);
    entity.setWaterTempMin(intVal);
    entity.setWaterTempMax(intVal);
    entity.setDewingMethod("DM2");
    entity.setAverageDrumSpeed("ADS");
    entity.setWaterTemp("WTC");

    entity.setTotalHoursBatch(intVal);
    entity.setTotalMinutesBatch(intVal);
    entity.setTotalMistingMinutes(intVal);
    entity.setTotalMistingSeconds(intVal);
    entity.setDewingSeparation("DSE");
    entity.setHandDewing(1);
    entity.setProcessMachine("PMC");
    entity.setSepMachine("SMC");
    entity.setNoPneumatic(intVal);

    entity.setDryWeight(decimalVal);
    entity.setPriorMoist(decimalVal);
    entity.setTargetFreshWeight(decimalVal);
    entity.setTargetMoistureContent(decimalVal);
    entity.setDrybackWeight(decimalVal);
    entity.setDrybackMoist(decimalVal);
    entity.setDryingMethod("DRY");
    entity.setTemperature(intVal);
    entity.setDepthPerTray(intVal);
    entity.setScreenMachineOne("SM1");
    entity.setScreenMachineTwo("SM2");
    entity.setScreenMachineThree("SM3");
    entity.setNoTimesRepeated(intVal);
    entity.setWaterType("WTP");
    entity.setTumblerType("TBT");
    entity.setTumblerSlope(intVal);
    entity.setTumblerRpm(decimalVal);
    entity.setIntermediateCleaner(1);
    entity.setClosedPercentage(intVal);
    entity.setSlightFlex(intVal);
    entity.setModerateFlex(intVal);
    entity.setFullFlex(intVal);
    entity.setKilnProgram("KILN");
    entity.setTurningPrfmd(1);
    entity.setHoursRequired(decimalVal);
    entity.setFilledSeedAverage(decimalVal);
    entity.setRiaComment("Sample comment");
    entity.setImbibedWeight(decimalVal);
    entity.setDrybackTime(intVal);
    entity.setTargetThirtyMoist(decimalVal);
    entity.setTargetThirtyFiveMoist(decimalVal);
    entity.setStratEndWeight(decimalVal);

    // Assert sample fields
    assertThat(entity.getRiaKey()).isEqualByComparingTo(decimalVal);
    assertThat(entity.getRequestId()).isEqualTo("REQ123456");
    assertThat(entity.getActualBeginDateTime()).isEqualTo(dateTimeVal);
    assertThat(entity.getDryWeight()).isEqualByComparingTo(decimalVal);
    assertThat(entity.getKilnProgram()).isEqualTo("KILN");
    assertThat(entity.getRiaComment()).isEqualTo("Sample comment");
    assertThat(entity.getTestCategoryCode()).isEqualTo("TCC");
    assertThat(entity.getWaterTemp()).isEqualTo("WTC");
    assertThat(entity.getTurningPrfmd()).isEqualTo(1);
  }
}
