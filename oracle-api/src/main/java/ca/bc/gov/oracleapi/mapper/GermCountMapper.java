package ca.bc.gov.oracleapi.mapper;

import ca.bc.gov.oracleapi.dto.consep.GermCountDto;
import ca.bc.gov.oracleapi.entity.consep.GermCountEntity;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

/** Maps between {@link GermCountEntity} and {@link GermCountDto}. */
@Mapper
public interface GermCountMapper {

  GermCountMapper mapper = Mappers.getMapper(GermCountMapper.class);

  GermCountDto toDto(GermCountEntity entity);
}
