package ca.bc.gov.oracleapi.mapper;

import ca.bc.gov.oracleapi.dto.consep.TestRepGermFormDto;
import ca.bc.gov.oracleapi.entity.consep.TestRepGermEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

/** Maps a submitted {@link TestRepGermFormDto} onto a {@link TestRepGermEntity}. */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    unmappedSourcePolicy = ReportingPolicy.IGNORE)
public interface TestRepGermFormMapper {

  /**
   * Copies the submitted replicate totals onto an existing (or new) entity. Updating in place
   * rather than building a replacement leaves the composite key and any column this entity does
   * not map untouched.
   *
   * @param dto    the submitted replicate totals
   * @param entity the entity to populate
   */
  @Mapping(target = "id", ignore = true)
  void updateEntity(TestRepGermFormDto dto, @MappingTarget TestRepGermEntity entity);
}
