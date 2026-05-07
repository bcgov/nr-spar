package ca.bc.gov.oracleapi.mapper;

import ca.bc.gov.oracleapi.dto.consep.TestRepGermDto;
import ca.bc.gov.oracleapi.entity.consep.TestRepGermEntity;

/**
 * Utility class responsible for mapping between {@link TestRepGermEntity}
 * and {@link TestRepGermDto}.
 */
public class TestRepGermMapper {
  /**
   * Converts a {@link TestRepGermEntity} into a {@link TestRepGermDto}.
   *
   * @param entity the entity to be converted
   * @return a DTO containing the relevant data from the entity
   */
  public static TestRepGermDto convertToDto(TestRepGermEntity entity) {
    return new TestRepGermDto(
        entity.getId().getRiaKey(),
        entity.getId().getReplicateNumber(),
        entity.getTotalNoSeeds(),
        entity.getFinalUngrmNormal(),
        entity.getFinalUngrmShrvl(),
        entity.getFinalUngrmEmpty(),
        entity.getFinalUngrmInsct(),
        entity.getFinalUngrmDamagd(),
        entity.getFinalUngrmRotten(),
        entity.getFinalPregerm(),
        entity.getRepAcceptedInd(),
        entity.getTolrncOvrrdeDesc()
    );
  }
}
