package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.SeedlotSearchResultDto;
import ca.bc.gov.backendstartapi.entity.seedlot.Seedlot;
import ca.bc.gov.backendstartapi.exception.UserNotFoundException;
import ca.bc.gov.backendstartapi.mapper.SeedlotSearchMapper;
import ca.bc.gov.backendstartapi.repository.SeedlotRepository;
import ca.bc.gov.backendstartapi.search.PageResponse;
import ca.bc.gov.backendstartapi.search.SearchRequest;
import ca.bc.gov.backendstartapi.search.SearchSchema;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import ca.bc.gov.backendstartapi.security.UserInfo;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Paginated, filterable seedlot search. */
@Service
@RequiredArgsConstructor
public class SeedlotSearchService {

  private final SeedlotRepository seedlotRepository;
  private final LoggedUserService loggedUserService;
  private final SeedlotSearchMapper seedlotSearchMapper;
  private final SearchSchema<Seedlot> schema;

  /**
   * Runs a search, restricted to the seedlots the logged user may see.
   *
   * @param request filter, sort and paging
   * @return one page of results
   */
  @Transactional(readOnly = true)
  public PageResponse<SeedlotSearchResultDto> search(SearchRequest request) {
    Page<Seedlot> page = schema.find(seedlotRepository, request, accessScope());
    return PageResponse.from(page.map(seedlotSearchMapper::toDto));
  }

  /**
   * Row-level access, always ANDed with the client's filter: TSC admins see everything, everyone
   * else only seedlots whose applicant is one of their client numbers.
   */
  private Specification<Seedlot> accessScope() {
    if (loggedUserService.isTscAdminLogged()) {
      return (root, query, cb) -> cb.conjunction();
    }
    List<String> clientIds =
        loggedUserService
            .getLoggedUserInfo()
            .map(UserInfo::clientIds)
            .orElseThrow(UserNotFoundException::new);
    if (clientIds.isEmpty()) {
      return (root, query, cb) -> cb.disjunction();
    }
    return (root, query, cb) -> root.get("applicantClientNumber").in(clientIds);
  }
}
