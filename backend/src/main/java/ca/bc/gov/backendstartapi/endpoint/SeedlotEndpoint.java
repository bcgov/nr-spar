package ca.bc.gov.backendstartapi.endpoint;

import ca.bc.gov.backendstartapi.dto.SeedlotCreateDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.service.SeedlotService;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** This class contains resources for handling {@link Seedlot} operations. */
@RestController
@RequestMapping(path = "/api/seedlots", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(
    name = "Seedlots",
    description = "This class contains resources for handling `Seedlot` operations.")
public class SeedlotEndpoint {

  private final SeedlotService seedlotService;

  /**
   * Created a new Seedlot in the system.
   *
   * @param createDto A {@link SeedlotCreateDto} containig all required field to get a new
   *     registration started.
   * @return A {@link Seedlot} with all created values.
   */
  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  public Seedlot createSeedlot(@Valid @RequestBody SeedlotCreateDto createDto) {
    return seedlotService.createSeedlot(createDto);
  }
}

/**
 * [ ] Endpoint [ ] Service [ ] Repository [ ] EndpointTest [ ] ServiceTest [ ] RepositoryTest [ ]
 * Checkstyle [ ] Tests passing
 */
