package ca.bc.gov.oracleapi.config;

import ca.bc.gov.oracleapi.dto.AreaOfUseDto;
import ca.bc.gov.oracleapi.dto.AreaOfUseSpuGeoDto;
import ca.bc.gov.oracleapi.dto.GeospatialRequestDto;
import ca.bc.gov.oracleapi.dto.GeospatialRespondDto;
import ca.bc.gov.oracleapi.dto.ListItemDto;
import ca.bc.gov.oracleapi.dto.OrchardDto;
import ca.bc.gov.oracleapi.dto.OrchardParentTreeDto;
import ca.bc.gov.oracleapi.dto.ParentTreeDto;
import ca.bc.gov.oracleapi.dto.ParentTreeGeneticInfoDto;
import ca.bc.gov.oracleapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.oracleapi.dto.SameSpeciesTreeDto;
import ca.bc.gov.oracleapi.dto.SparBecZoneDescriptionDto;
import ca.bc.gov.oracleapi.dto.SpuDto;
import ca.bc.gov.oracleapi.dto.SpzDto;
import ca.bc.gov.oracleapi.endpoint.parameters.PaginatedViaQuery;
import ca.bc.gov.oracleapi.endpoint.parameters.PaginationParameters;
import ca.bc.gov.oracleapi.util.ModelMapper;
import org.springframework.aot.hint.annotation.RegisterReflectionForBinding;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportRuntimeHints;

/** This class holds configurations for building Cloud Native images. */
@Configuration
@RegisterReflectionForBinding({
  AreaOfUseDto.class,
  AreaOfUseSpuGeoDto.class,
  GeospatialRequestDto.class,
  GeospatialRespondDto.class,
  ListItemDto.class,
  OrchardDto.class,
  OrchardParentTreeDto.class,
  ParentTreeDto.class,
  ParentTreeGeneticInfoDto.class,
  ParentTreeGeneticQualityDto.class,
  SameSpeciesTreeDto.class,
  SparBecZoneDescriptionDto.class,
  SpuDto.class,
  SpzDto.class,
  PaginatedViaQuery.class,
  PaginationParameters.class,
  ModelMapper.class,
})
@ImportRuntimeHints(value = {HttpServletRequestRuntimeHint.class})
public class NativeImageConfig {}
