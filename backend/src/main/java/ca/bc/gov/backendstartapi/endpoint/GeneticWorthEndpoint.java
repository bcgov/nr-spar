package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.GeneticWorthSummaryDto;
import ca.bc.gov.backendstartapi.dto.GeneticWorthTraitsDto;
import ca.bc.gov.backendstartapi.enums.GeneticWorthEnum;
import ca.bc.gov.backendstartapi.service.GeneticWorthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints to fetch {@link GeneticWorthEnum}. */
@RestController
@RequestMapping(path = "/api/genetic-worth", produces = MimeTypeUtils.APPLICATION_JSON_VALUE)
@Tag(name = "GeneticWorth")
public class GeneticWorthEndpoint implements DescribedEnumEndpoint<GeneticWorthEnum> {

  private final GeneticWorthService geneticWorthService;

  GeneticWorthEndpoint(GeneticWorthService geneticWorthService) {
    this.geneticWorthService = geneticWorthService;
  }

  @Override
  public Class<GeneticWorthEnum> enumClass() {
    return GeneticWorthEnum.class;
  }

  @PostMapping(path = "/calculate-file", consumes = MediaType.APPLICATION_JSON_VALUE)
  public GeneticWorthSummaryDto geneticTraitsCalculations(@RequestBody List<GeneticWorthTraitsDto> traitsDto) {
    return geneticWorthService.calculateGeneticWorth(traitsDto);
  }
}
