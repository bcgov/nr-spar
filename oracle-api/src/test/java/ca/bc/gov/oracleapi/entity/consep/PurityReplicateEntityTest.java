package ca.bc.gov.oracleapi.entity.consep;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class PurityReplicateEntityTest {

  @Test
  void testEntityGettersAndSetters() {
    // Create embedded ID
    ReplicateId id = new ReplicateId();
    id.setRiaKey(new BigDecimal("1234567890"));
    id.setReplicateNumber(1);

    // Create entity and set all values
    PurityReplicateEntity entity = new PurityReplicateEntity();
    entity.setId(id);
    entity.setPureSeedWeight(new BigDecimal("100.500"));
    entity.setOtherSeedWeight(new BigDecimal("5.250"));
    entity.setInertMttrWeight(new BigDecimal("2.100"));
    entity.setReplicateAccInd(1);
    entity.setOverrideReason("Sample override reason");

    // Verify all getters
    assertEquals(id, entity.getId());
    assertEquals(new BigDecimal("100.500"), entity.getPureSeedWeight());
    assertEquals(new BigDecimal("5.250"), entity.getOtherSeedWeight());
    assertEquals(new BigDecimal("2.100"), entity.getInertMttrWeight());
    assertEquals(1, entity.getReplicateAccInd());
    assertEquals("Sample override reason", entity.getOverrideReason());
  }

  @Test
  void testEntityWithNullValues() {
    PurityReplicateEntity entity = new PurityReplicateEntity();

    // Set all nullable fields to null
    entity.setId(null);
    entity.setPureSeedWeight(null);
    entity.setOtherSeedWeight(null);
    entity.setInertMttrWeight(null);
    entity.setReplicateAccInd(null);
    entity.setOverrideReason(null);

    // Verify null values are handled
    assertNull(entity.getId());
    assertNull(entity.getPureSeedWeight());
    assertNull(entity.getOtherSeedWeight());
    assertNull(entity.getInertMttrWeight());
    assertNull(entity.getReplicateAccInd());
    assertNull(entity.getOverrideReason());
  }

  @Test
  void testEntityEqualsAndHashCode() {
    ReplicateId id1 = new ReplicateId();
    id1.setRiaKey(new BigDecimal("1"));
    id1.setReplicateNumber(1);

    ReplicateId id2 = new ReplicateId();
    id2.setRiaKey(new BigDecimal("1"));
    id2.setReplicateNumber(1);

    ReplicateId id3 = new ReplicateId();
    id3.setRiaKey(new BigDecimal("2"));
    id3.setReplicateNumber(1);

    PurityReplicateEntity entity1 = new PurityReplicateEntity();
    entity1.setId(id1);
    entity1.setPureSeedWeight(new BigDecimal("100.000"));

    PurityReplicateEntity entity2 = new PurityReplicateEntity();
    entity2.setId(id2);
    entity2.setPureSeedWeight(new BigDecimal("200.000")); // Different value but same ID

    PurityReplicateEntity entity3 = new PurityReplicateEntity();
    entity3.setId(id3);
    entity3.setPureSeedWeight(new BigDecimal("100.000"));

    assertNotEquals(entity1, entity3);
    assertNotEquals(entity1.hashCode(), entity3.hashCode());
  }

  @Test
  void testEntityBoundaryValues() {
    ReplicateId id = new ReplicateId();
    id.setRiaKey(new BigDecimal("9999999999"));
    id.setReplicateNumber(999);

    PurityReplicateEntity entity = new PurityReplicateEntity();
    entity.setId(id);

    // Test maximum values based on column precision/scale
    entity.setPureSeedWeight(new BigDecimal("9999.999"));
    entity.setOtherSeedWeight(new BigDecimal("9999.999"));
    entity.setInertMttrWeight(new BigDecimal("9999.999"));
    entity.setOverrideReason("x".repeat(2000));

    assertEquals(new BigDecimal("9999.999"), entity.getPureSeedWeight());
    assertEquals(new BigDecimal("9999.999"), entity.getOtherSeedWeight());
    assertEquals(new BigDecimal("9999.999"), entity.getInertMttrWeight());
    assertEquals("x".repeat(2000), entity.getOverrideReason());

    // Test minimum values
    entity.setPureSeedWeight(new BigDecimal("0.001"));
    entity.setOtherSeedWeight(new BigDecimal("0.001"));
    entity.setInertMttrWeight(new BigDecimal("0.001"));
    entity.setOverrideReason("");

    assertEquals(new BigDecimal("0.001"), entity.getPureSeedWeight());
    assertEquals(new BigDecimal("0.001"), entity.getOtherSeedWeight());
    assertEquals(new BigDecimal("0.001"), entity.getInertMttrWeight());
    assertEquals("", entity.getOverrideReason());
  }
}