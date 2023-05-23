package ca.bc.gov.backendstartapi.config;

import org.springframework.aot.hint.annotation.RegisterReflectionForBinding;
import org.springframework.context.annotation.Configuration;

import ca.bc.gov.backendstartapi.dto.OrchardLotTypeDescriptionDto;
import ca.bc.gov.backendstartapi.dto.OrchardParentTreeDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeDto;
import ca.bc.gov.backendstartapi.dto.ParentTreeGeneticQualityDto;
import ca.bc.gov.backendstartapi.dto.UserDto;
import ca.bc.gov.backendstartapi.response.ExceptionResponse;
import ca.bc.gov.backendstartapi.response.ValidationExceptionResponse;
import ca.bc.gov.backendstartapi.vo.CheckVo;

@Configuration
@RegisterReflectionForBinding({
  OrchardLotTypeDescriptionDto.class,
  OrchardParentTreeDto.class,
  ParentTreeDto.class,
  ParentTreeGeneticQualityDto.class,
  UserDto.class,
  ExceptionResponse.class,
  ValidationExceptionResponse.class,
  CheckVo.class
})
public class NativeImageConfig {}
