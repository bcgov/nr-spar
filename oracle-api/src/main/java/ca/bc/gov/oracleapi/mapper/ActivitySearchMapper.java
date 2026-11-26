package ca.bc.gov.oracleapi.mapper;

import ca.bc.gov.oracleapi.dto.consep.ActivitySearchResponseDto;
import ca.bc.gov.oracleapi.entity.consep.ActivitySearchResultEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

/**
 * Maps testing activity search rows to their response DTO. Every DTO field matches an entity
 * field by name; a DTO field without a source fails the build.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface ActivitySearchMapper {

  ActivitySearchResponseDto toDto(ActivitySearchResultEntity entity);
}
