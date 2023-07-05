package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.OrchardSpuDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SpuOrchardProvider {

  public List<OrchardSpuDto> fetchOrchardSpus() {
    // TODO
    return List.of();
  }
}
