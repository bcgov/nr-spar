package ca.bc.gov.backendstartapi.mapper;

import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDtoClassB;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.util.ValueUtil;
import java.util.List;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

/**
 * Maps B-class collection step fields between {@link Seedlot} and {@link
 * SeedlotFormCollectionDtoClassB}.
 */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    unmappedSourcePolicy = ReportingPolicy.IGNORE)
public interface SeedlotFormCollectionBclassMapper {

  @Mapping(target = "collectionLocnCode", source = "seedlot.collectionLocationCode")
  @Mapping(target = "noOfContainers", source = "seedlot.numberOfContainers")
  @Mapping(target = "volPerContainer", source = "seedlot.containerVolume")
  @Mapping(target = "clctnVolume", source = "seedlot.totalConeVolume")
  @Mapping(target = "seedlotComment", source = "seedlot.comment")
  SeedlotFormCollectionDtoClassB toDto(
      Seedlot seedlot, String collectionGeometryGeoJson, List<Integer> coneCollectionMethodCodes);

  /**
   * Copies renamed collection DTO fields onto an existing seedlot. Collection dates are applied in
   * {@link #applyDatesOnlyWhenChanged} so unchanged values do not bump the revision.
   */
  @Mapping(target = "collectionLocationCode", source = "collectionLocnCode")
  @Mapping(target = "numberOfContainers", source = "noOfContainers")
  @Mapping(target = "containerVolume", source = "volPerContainer")
  @Mapping(target = "totalConeVolume", source = "clctnVolume")
  @Mapping(target = "comment", source = "seedlotComment")
  @Mapping(target = "collectionStartDate", ignore = true)
  @Mapping(target = "collectionEndDate", ignore = true)
  void applyToSeedlot(SeedlotFormCollectionDtoClassB dto, @MappingTarget Seedlot seedlot);

  /** Applies collection dates only when they differ from the current seedlot values. */
  @AfterMapping
  default void applyDatesOnlyWhenChanged(
      SeedlotFormCollectionDtoClassB dto, @MappingTarget Seedlot seedlot) {
    if (!ValueUtil.isValueEqual(seedlot.getCollectionStartDate(), dto.collectionStartDate())) {
      seedlot.setCollectionStartDate(dto.collectionStartDate());
    }
    if (!ValueUtil.isValueEqual(seedlot.getCollectionEndDate(), dto.collectionEndDate())) {
      seedlot.setCollectionEndDate(dto.collectionEndDate());
    }
  }
}
