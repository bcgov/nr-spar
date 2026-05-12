package ca.bc.gov.oracleapi.mapper;

import ca.bc.gov.oracleapi.dto.consep.TestRepGermDto;
import ca.bc.gov.oracleapi.entity.consep.TestRepGermEntity;

/**
 * Utility class responsible for mapping between {@link TestRepGermEntity}
 * and {@link TestRepGermDto}.
 */
public final class TestRepGermMapper {

  private TestRepGermMapper() {}

  /**
   * Converts a {@link TestRepGermEntity} into a {@link TestRepGermDto}.
   *
   * @param entity the entity to be converted
   * @return a DTO containing the relevant data from the entity
   */
  public static TestRepGermDto convertToDto(TestRepGermEntity entity) {
    Integer totalNoSeeds = entity.getTotalNoSeeds();
    // Issue #2445: a replicate cannot be accepted unless total seeds > 0
    Integer repAcceptedInd =
        (totalNoSeeds == null || totalNoSeeds <= 0) ? 0 : entity.getRepAcceptedInd();

    return new TestRepGermDto(
        entity.getId().getRiaKey(),
        entity.getId().getReplicateNumber(),
        totalNoSeeds,
        entity.getFinalUngrmNormal(),
        entity.getFinalUngrmShrvl(),
        entity.getFinalUngrmEmpty(),
        entity.getFinalUngrmInsct(),
        entity.getFinalUngrmDamagd(),
        entity.getFinalUngrmRotten(),
        entity.getFinalPregerm(),
        repAcceptedInd,
        entity.getTolrncOvrrdeDesc()
    );
  }
}
