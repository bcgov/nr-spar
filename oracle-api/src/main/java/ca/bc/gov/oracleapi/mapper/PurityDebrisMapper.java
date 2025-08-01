package ca.bc.gov.oracleapi.mapper;

import ca.bc.gov.oracleapi.dto.consep.PurityDebrisDto;
import ca.bc.gov.oracleapi.entity.consep.PurityDebrisEntity;

public class PurityDebrisMapper {
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
