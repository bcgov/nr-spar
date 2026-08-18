package ca.bc.gov.backendstartapi.config;

import ca.bc.gov.backendstartapi.dto.CalculatedParentTreeValsDto;
import ca.bc.gov.backendstartapi.dto.CodeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.DescribedEnumDto;
import ca.bc.gov.backendstartapi.dto.FavouriteActivityCreateDto;
import ca.bc.gov.backendstartapi.dto.FavouriteActivityUpdateDto;
import ca.bc.gov.backendstartapi.dto.ForestClientDto;
import ca.bc.gov.backendstartapi.dto.ForestClientLocationDto;
import ca.bc.gov.backendstartapi.dto.ForestClientSearchDto;
import ca.bc.gov.backendstartapi.dto.GameticMethodologyDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.dto.GeospatialOracleResDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRequestDto;
import ca.bc.gov.backendstartapi.dto.GeospatialRespondDto;
import ca.bc.gov.backendstartapi.dto.ListItemDto;
import ca.bc.gov.backendstartapi.dto.MethodOfPaymentDto;
import ca.bc.gov.backendstartapi.dto.OrchardDto;
import ca.bc.gov.backendstartapi.dto.OrchardParentTreeValsDto;
import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticInfoDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.PtCalculationResDto;
import ca.bc.gov.backendstartapi.dto.PtValsCalReqDto;
import ca.bc.gov.backendstartapi.dto.RevisionCountDto;
import ca.bc.gov.backendstartapi.dto.SameSpeciesTreeDto;
import ca.bc.gov.backendstartapi.dto.SaveSeedlotFormDto;
import ca.bc.gov.backendstartapi.dto.SeedPlanZoneDto;
import ca.bc.gov.backendstartapi.dto.SeedlotAclassFormDto;
import ca.bc.gov.backendstartapi.dto.SeedlotApplicationPatchDto;
import ca.bc.gov.backendstartapi.dto.SeedlotBclassDetailDto;
import ca.bc.gov.backendstartapi.dto.SeedlotBclassFormDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCollectionGeometryDto;
import ca.bc.gov.backendstartapi.dto.SeedlotCreateDto;
import ca.bc.gov.backendstartapi.dto.SeedlotDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormCollectionDtoClassB;
import ca.bc.gov.backendstartapi.dto.SeedlotFormExtractionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormInterimDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOrchardDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormOwnershipDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormParentTreeSmpDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDto;
import ca.bc.gov.backendstartapi.dto.SeedlotFormSubmissionDtoClassB;
import ca.bc.gov.backendstartapi.dto.SeedlotReviewElevationLatLongDto;
import ca.bc.gov.backendstartapi.dto.SeedlotReviewGeoInformationDto;
import ca.bc.gov.backendstartapi.dto.SeedlotReviewSeedPlanZoneDto;
import ca.bc.gov.backendstartapi.dto.SeedlotSaveInMemoryDto;
import ca.bc.gov.backendstartapi.dto.SeedlotSourceDto;
import ca.bc.gov.backendstartapi.dto.SeedlotStatusResponseDto;
import ca.bc.gov.backendstartapi.dto.oracle.AreaOfUseDto;
import ca.bc.gov.backendstartapi.dto.oracle.AreaOfUseSpuGeoDto;
import ca.bc.gov.backendstartapi.dto.oracle.OrgUnitDistrictDto;
import ca.bc.gov.backendstartapi.dto.oracle.SpuDto;
import ca.bc.gov.backendstartapi.dto.oracle.SpzDto;
import ca.bc.gov.backendstartapi.enums.DescribedEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientExpiredEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientStatusEnum;
import ca.bc.gov.backendstartapi.enums.ForestClientTypeEnum;
import ca.bc.gov.backendstartapi.enums.LatitudeCodeEnum;
import ca.bc.gov.backendstartapi.enums.LongitudeCodeEnum;
import ca.bc.gov.backendstartapi.enums.parser.ConeAndPollenCountHeader;
import ca.bc.gov.backendstartapi.enums.parser.CsvParsingHeader;
import ca.bc.gov.backendstartapi.enums.parser.SmpMixHeader;
import ca.bc.gov.backendstartapi.report.Sprr001MainRow;
import ca.bc.gov.backendstartapi.report.Sprr001OwnershipRow;
import ca.bc.gov.backendstartapi.util.ValueUtil;
import ca.bc.gov.backendstartapi.vo.parser.ConeAndPollenCount;
import ca.bc.gov.backendstartapi.vo.parser.SmpMixVolume;
import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.aot.hint.annotation.RegisterReflectionForBinding;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportRuntimeHints;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

/** This class holds configurations for building Cloud Native images. */
@Configuration
@RegisterReflectionForBinding({
    DescribedEnumDto.class,
    FavouriteActivityCreateDto.class,
    FavouriteActivityUpdateDto.class,
    ForestClientDto.class,
    ConeAndPollenCount.class,
    SeedPlanZoneDto.class,
    SmpMixVolume.class,
    GeospatialOracleResDto.class,
    AreaOfUseDto.class,
    AreaOfUseSpuGeoDto.class,
    SpzDto.class,
    CalculatedParentTreeValsDto.class,
    CodeDescriptionDto.class,
    DescribedEnumDto.class,
    FavouriteActivityCreateDto.class,
    FavouriteActivityUpdateDto.class,
    ForestClientDto.class,
    ForestClientLocationDto.class,
    ForestClientSearchDto.class,
    GameticMethodologyDto.class,
    GeneticWorthTraitsDto.class,
    GeospatialOracleResDto.class,
    GeospatialRequestDto.class,
    GeospatialRespondDto.class,
    ListItemDto.class,
    MethodOfPaymentDto.class,
    OrchardDto.class,
    OrchardParentTreeValsDto.class,
    OrchardSpuDto.class,
    ParentTreeDto.class,
    ParentTreeGeneticInfoDto.class,
    ParentTreeGeneticQualityDto.class,
    PtCalculationResDto.class,
    PtValsCalReqDto.class,
    RevisionCountDto.class,
    SameSpeciesTreeDto.class,
    SaveSeedlotFormDto.class,
    SeedPlanZoneDto.class,
    SeedlotAclassFormDto.class,
    SeedlotBclassDetailDto.class,
    SeedlotBclassFormDto.class,
    SeedlotFormCollectionDtoClassB.class,
    SeedlotFormSubmissionDtoClassB.class,
    SeedlotCollectionGeometryDto.class,
    SeedlotApplicationPatchDto.class,
    SeedlotCreateDto.class,
    SeedlotDto.class,
    SeedlotFormCollectionDto.class,
    SeedlotFormExtractionDto.class,
    SeedlotFormInterimDto.class,
    SeedlotFormOrchardDto.class,
    SeedlotFormOwnershipDto.class,
    SeedlotFormParentTreeSmpDto.class,
    SeedlotFormSubmissionDto.class,
    SeedlotReviewElevationLatLongDto.class,
    SeedlotReviewGeoInformationDto.class,
    SeedlotReviewSeedPlanZoneDto.class,
    SeedlotSourceDto.class,
    SeedlotStatusResponseDto.class,
    AreaOfUseDto.class,
    AreaOfUseSpuGeoDto.class,
    OrgUnitDistrictDto.class,
    SpuDto.class,
    SpzDto.class,
    DescribedEnum.class,
    ForestClientExpiredEnum.class,
    ForestClientStatusEnum.class,
    ForestClientTypeEnum.class,
    LatitudeCodeEnum.class,
    LongitudeCodeEnum.class,
    ConeAndPollenCountHeader.class,
    CsvParsingHeader.class,
    SmpMixHeader.class,
    SeedlotSaveInMemoryDto.class,
    ValueUtil.class,
})
@ImportRuntimeHints(
    value = {
      HttpServletRequestRuntimeHint.class,
      ValidationRuntimeHint.class,
      NativeImageConfig.class
    })
public class NativeImageConfig implements RuntimeHintsRegistrar {

  @Override
  public void registerHints(@NonNull RuntimeHints hints, @Nullable ClassLoader classLoader) {
    hints.resources().registerPattern("reports/SPRR001/*");
    hints
        .reflection()
        .registerType(
            Sprr001MainRow.class,
            MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
            MemberCategory.INVOKE_PUBLIC_METHODS,
            MemberCategory.DECLARED_FIELDS);
    hints
        .reflection()
        .registerType(
            Sprr001OwnershipRow.class,
            MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
            MemberCategory.INVOKE_PUBLIC_METHODS,
            MemberCategory.DECLARED_FIELDS);
  }
}
