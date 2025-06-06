package ca.bc.gov.oracleapi.entity.consep;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import ca.bc.gov.oracleapi.entity.consep.idclass.ReplicateId;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class MccReplicateEntityTest {

  @Test
  void testEntityGettersAndSetters() {
    // Create embedded ID
    ReplicateId id = new ReplicateId();
    id.setRiaKey(new BigDecimal("1234567890"));
    id.setReplicateNumber(1);

    // Create entity and set all values
    MccReplicateEntity entity = new MccReplicateEntity();
    entity.setId(id);
    entity.setContainerId("CTR1");
    entity.setFreshSeed(new BigDecimal("123.456"));
    entity.setContainerAndDryWeight(new BigDecimal("234.567"));
    entity.setContainerWeight(new BigDecimal("111.111"));
    entity.setDryWeight(new BigDecimal("123.456"));
    entity.setReplicateAccInd(1);
    entity.setOverrideReason("Sample override reason");
    entity.setReplicateComment("Sample comment");

    // Verify all getters
    assertEquals(id, entity.getId());
    assertEquals("CTR1", entity.getContainerId());
    assertEquals(new BigDecimal("123.456"), entity.getFreshSeed());
    assertEquals(new BigDecimal("234.567"), entity.getContainerAndDryWeight());
    assertEquals(new BigDecimal("111.111"), entity.getContainerWeight());
    assertEquals(new BigDecimal("123.456"), entity.getDryWeight());
    assertEquals(1, entity.getReplicateAccInd());
    assertEquals("Sample override reason", entity.getOverrideReason());
    assertEquals("Sample comment", entity.getReplicateComment());
  }

  @Test
  void testEntityWithNullValues() {
    MccReplicateEntity entity = new MccReplicateEntity();
    
    // Set some values to null
    entity.setId(null);
    entity.setContainerId(null);
    entity.setFreshSeed(null);
    entity.setOverrideReason(null);
    
    // Verify null values are handled
    assertNull(entity.getId());
    assertNull(entity.getContainerId());
    assertNull(entity.getFreshSeed());
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

    MccReplicateEntity entity1 = new MccReplicateEntity();
    entity1.setId(id1);
    entity1.setContainerId("CTR1");

    MccReplicateEntity entity2 = new MccReplicateEntity();
    entity2.setId(id2);
    entity2.setContainerId("CTR1");

    MccReplicateEntity entity3 = new MccReplicateEntity();
    entity3.setId(id3);
    entity3.setContainerId("CTR1");

    // Test equals
    assertNotEquals(entity1, entity3);
    
    // Test hashCode
    assertNotEquals(entity1.hashCode(), entity3.hashCode());
  }

  @Test
  void testEntityBoundaryValues() {
    ReplicateId id = new ReplicateId();
    id.setRiaKey(new BigDecimal("9999999999"));
    id.setReplicateNumber(999);

    MccReplicateEntity entity = new MccReplicateEntity();
    entity.setId(id);
    
    // Test maximum values based on column precision/scale
    entity.setFreshSeed(new BigDecimal("9999.999"));
    entity.setContainerAndDryWeight(new BigDecimal("9999.999"));
    entity.setContainerWeight(new BigDecimal("9999.999"));
    entity.setDryWeight(new BigDecimal("9999.999"));
    entity.setOverrideReason("x".repeat(2000));
    entity.setReplicateComment("x".repeat(255));

    assertEquals(new BigDecimal("9999.999"), entity.getFreshSeed());
    assertEquals(new BigDecimal("9999.999"), entity.getContainerAndDryWeight());
    assertEquals(new BigDecimal("9999.999"), entity.getContainerWeight());
    assertEquals(new BigDecimal("9999.999"), entity.getDryWeight());
    assertEquals("x".repeat(2000), entity.getOverrideReason());
    assertEquals("x".repeat(255), entity.getReplicateComment());
    
    // Test minimum values
    entity.setFreshSeed(new BigDecimal("0.001"));
    entity.setContainerAndDryWeight(new BigDecimal("0.001"));
    entity.setContainerWeight(new BigDecimal("0.001"));
    entity.setDryWeight(new BigDecimal("0.001"));
    entity.setOverrideReason("");
    entity.setReplicateComment("");
    
    assertEquals(new BigDecimal("0.001"), entity.getFreshSeed());
    assertEquals(new BigDecimal("0.001"), entity.getContainerAndDryWeight());
    assertEquals(new BigDecimal("0.001"), entity.getContainerWeight());
    assertEquals(new BigDecimal("0.001"), entity.getDryWeight());
    assertEquals("", entity.getOverrideReason());
    assertEquals("", entity.getReplicateComment());
  }
}