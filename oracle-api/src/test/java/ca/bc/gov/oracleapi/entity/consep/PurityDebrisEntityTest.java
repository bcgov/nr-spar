package ca.bc.gov.oracleapi.entity.consep;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import ca.bc.gov.oracleapi.entity.consep.idclass.DebrisId;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class PurityDebrisEntityTest {

  @Test
  void testEntityGettersAndSetters() {
    DebrisId id = new DebrisId(
        new BigDecimal("123"),
        1,
        2
    );

    PurityDebrisEntity entity = new PurityDebrisEntity();
    entity.setId(id);
    entity.setDebrisSeqNumber(new BigDecimal("10.5"));
    entity.setDebrisTypeCode("DEF");

    assertEquals(id, entity.getId());
    assertEquals(new BigDecimal("10.5"), entity.getDebrisSeqNumber());
    assertEquals("DEF", entity.getDebrisTypeCode());
  }

  @Test
  void testEntityWithNullValues() {
    PurityDebrisEntity entity = new PurityDebrisEntity();

    entity.setId(null);
    entity.setDebrisSeqNumber(null);
    entity.setDebrisTypeCode(null);

    assertNull(entity.getId());
    assertNull(entity.getDebrisSeqNumber());
    assertNull(entity.getDebrisTypeCode());
  }

  @Test
  void testBoundaryValues() {
    DebrisId id = new DebrisId(
        new BigDecimal("9999999999"),
        999,
        999
    );

    PurityDebrisEntity entity = new PurityDebrisEntity();
    entity.setId(id);

    entity.setDebrisSeqNumber(new BigDecimal("999999.999"));
    entity.setDebrisTypeCode("ABC");

    assertEquals(new BigDecimal("999999.999"), entity.getDebrisSeqNumber());
    assertEquals("ABC", entity.getDebrisTypeCode());

    entity.setDebrisSeqNumber(new BigDecimal("0.001"));
    entity.setDebrisTypeCode("X");

    assertEquals(new BigDecimal("0.001"), entity.getDebrisSeqNumber());
    assertEquals("X", entity.getDebrisTypeCode());
  }
}
