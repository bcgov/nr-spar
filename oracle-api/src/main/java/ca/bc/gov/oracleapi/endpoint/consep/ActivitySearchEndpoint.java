package ca.bc.gov.oracleapi.endpoint.consep;

import ca.bc.gov.oracleapi.dto.consep.ActivitySearchRequestDto;
import ca.bc.gov.oracleapi.dto.consep.ActivitySearchResponseDto;
import ca.bc.gov.oracleapi.service.consep.ActivitySearchService;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ModelAttribute;



import java.util.List;

@RestController
@RequestMapping("/api/search-activities")
@RequiredArgsConstructor
public class ActivitySearchEndpoint {
  private final ActivitySearchService activitySearchService;

  @GetMapping("/activities/search")
  public List<ActivitySearchResponseDto> searchActivities(
    @ModelAttribute ActivitySearchRequestDto filter,
    @ParameterObject Pageable paginationParameters
  ) {
    return activitySearchService.searchActivities(filter);
  }

}
