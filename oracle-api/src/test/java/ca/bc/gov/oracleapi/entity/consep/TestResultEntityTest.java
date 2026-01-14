package ca.bc.gov.oracleapi.entity.consep;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class TestResultEntityTest {

  @Test
  void testEntityGettersAndSetters() {
    LocalDate now = LocalDate.now();
    LocalDateTime nowTime = LocalDateTime.now();
    LocalDate tomorrow = now.plusDays(1);
    
    // Create entity and set all values
    TestResultEntity entity = new TestResultEntity();
    entity.setRiaKey(new BigDecimal("1234567890"));
    entity.setActivityType("TST");
    entity.setStandardTest(1);
    entity.setTestCategory("CAT");
    entity.setAcceptResult(1);
    entity.setTestCompleteInd(1);
    entity.setOriginalTest(1);
    entity.setCurrentTest(1);
    entity.setTestRank("A");
    entity.setSampleDesc("Sample Description");
    entity.setMoistureStatus("WET");
    entity.setGerminationPct(95);
    entity.setMoisturePct(new BigDecimal("12.5"));
    entity.setGerminationValue(90);
    entity.setPeakValueGrmPct(85);
    entity.setPeakValueNoDays(7);
    entity.setWeightPer100(new BigDecimal("123.456"));
    entity.setSeedsPerGram(1000);
    entity.setPurityPct(new BigDecimal("99.9"));
    entity.setOtherTestResult(new BigDecimal("123.456"));
    entity.setUpdateTimestamp(nowTime);
    entity.setStratStartDate(now);
    entity.setGermStartDate(now);
    entity.setGermNextStageDate(tomorrow);
    entity.setSeedWithdrawDate(tomorrow);
    entity.setWarmStratStartDate(now);
    entity.setDrybackStartDate(now);
    entity.setGerminatorEntry(now);
    entity.setGerminatorId("G");
    entity.setGerminatorTrayId(1);
    entity.setLabelInd(1);
    entity.setReSampleInd(0);

    // Verify all getters
    assertEquals(new BigDecimal("1234567890"), entity.getRiaKey());
    assertEquals("TST", entity.getActivityType());
    assertEquals(1, entity.getStandardTest());
    assertEquals("CAT", entity.getTestCategory());
    assertEquals(1, entity.getAcceptResult());
    assertEquals(1, entity.getTestCompleteInd());
    assertEquals(1, entity.getOriginalTest());
    assertEquals(1, entity.getCurrentTest());
    assertEquals("A", entity.getTestRank());
    assertEquals("Sample Description", entity.getSampleDesc());
    assertEquals("WET", entity.getMoistureStatus());
    assertEquals(95, entity.getGerminationPct());
    assertEquals(new BigDecimal("12.5"), entity.getMoisturePct());
    assertEquals(90, entity.getGerminationValue());
    assertEquals(85, entity.getPeakValueGrmPct());
    assertEquals(7, entity.getPeakValueNoDays());
    assertEquals(new BigDecimal("123.456"), entity.getWeightPer100());
    assertEquals(1000, entity.getSeedsPerGram());
    assertEquals(new BigDecimal("99.9"), entity.getPurityPct());
    assertEquals(new BigDecimal("123.456"), entity.getOtherTestResult());
    assertEquals(nowTime, entity.getUpdateTimestamp());
    assertEquals(now, entity.getStratStartDate());
    assertEquals(now, entity.getGermStartDate());
    assertEquals(tomorrow, entity.getGermNextStageDate());
    assertEquals(tomorrow, entity.getSeedWithdrawDate());
    assertEquals(now, entity.getWarmStratStartDate());
    assertEquals(now, entity.getDrybackStartDate());
    assertEquals(now, entity.getGerminatorEntry());
    assertEquals("G", entity.getGerminatorId());
    assertEquals(1, entity.getGerminatorTrayId());
    assertEquals(1, entity.getLabelInd());
    assertEquals(0, entity.getReSampleInd());
  }

  @Test
  void testEntityWithNullValues() {
    TestResultEntity entity = new TestResultEntity();
    
    // Set some values to null
    entity.setActivityType(null);
    entity.setTestCategory(null);
    entity.setMoisturePct(null);
    entity.setUpdateTimestamp(null);
    
    // Verify null values are handled
    assertNull(entity.getActivityType());
    assertNull(entity.getTestCategory());
    assertNull(entity.getMoisturePct());
    assertNull(entity.getUpdateTimestamp());
  }

  @Test
  void testEntityEqualsAndHashCode() {    
    TestResultEntity entity1 = new TestResultEntity();
    entity1.setRiaKey(new BigDecimal("1"));
    entity1.setActivityType("TST");
    
    TestResultEntity entity2 = new TestResultEntity();
    entity2.setRiaKey(new BigDecimal("1"));
    entity2.setActivityType("TST");
    
    TestResultEntity entity3 = new TestResultEntity();
    entity3.setRiaKey(new BigDecimal("2"));
    entity3.setActivityType("TST");
    
    // Test equals
    assertNotEquals(entity1, entity3);
    
    // Test hashCode
    assertNotEquals(entity1.hashCode(), entity3.hashCode());
  }

  @Test
  void testEntityBoundaryValues() {
    TestResultEntity entity = new TestResultEntity();
    
    // Test maximum values
    entity.setRiaKey(new BigDecimal("9999999999"));
    entity.setMoisturePct(new BigDecimal("999.9"));
    entity.setWeightPer100(new BigDecimal("9999.999"));
    entity.setPurityPct(new BigDecimal("999.9"));
    entity.setOtherTestResult(new BigDecimal("99999.999"));
    
    assertEquals(new BigDecimal("9999999999"), entity.getRiaKey());
    assertEquals(new BigDecimal("999.9"), entity.getMoisturePct());
    assertEquals(new BigDecimal("9999.999"), entity.getWeightPer100());
    assertEquals(new BigDecimal("999.9"), entity.getPurityPct());
    assertEquals(new BigDecimal("99999.999"), entity.getOtherTestResult());
    
    // Test minimum values
    entity.setRiaKey(new BigDecimal("0"));
    entity.setMoisturePct(new BigDecimal("0.0"));
    entity.setWeightPer100(new BigDecimal("0.000"));
    entity.setPurityPct(new BigDecimal("0.0"));
    entity.setOtherTestResult(new BigDecimal("0.000"));
    
    assertEquals(new BigDecimal("0"), entity.getRiaKey());
    assertEquals(new BigDecimal("0.0"), entity.getMoisturePct());
    assertEquals(new BigDecimal("0.000"), entity.getWeightPer100());
    assertEquals(new BigDecimal("0.0"), entity.getPurityPct());
    assertEquals(new BigDecimal("0.000"), entity.getOtherTestResult());
  }
}