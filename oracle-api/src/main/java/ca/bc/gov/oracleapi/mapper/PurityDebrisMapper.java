package ca.bc.gov.oracleapi.mapper;

import ca.bc.gov.oracleapi.dto.consep.PurityDebrisDto;
import ca.bc.gov.oracleapi.entity.consep.PurityDebrisEntity;

/**
 * Utility class responsible for mapping between {@link PurityDebrisEntity}
 * and {@link PurityDebrisDto}.
 */
public class PurityDebrisMapper {
  /**
   * Converts a {@link PurityDebrisEntity} into a {@link PurityDebrisDto}.
   *
   * @param entity the entity to be converted
   * @return a DTO containing the relevant data from the entity
   */
  public static PurityDebrisDto convertToDto(PurityDebrisEntity entity) {
    return new PurityDebrisDto(
        entity.getId().getRiaKey(),
        entity.getId().getReplicateNumber(),
        entity.getDebrisSeqNumber(),
        entity.getId().getDebrisRank(),
        entity.getDebrisTypeCode()
    );
  }
}
