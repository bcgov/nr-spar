package ca.bc.gov.oracleapi.service.consep;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import ca.bc.gov.oracleapi.dto.consep.ActivitySearchPageResponseDto;
import ca.bc.gov.oracleapi.dto.consep.ActivitySearchRequestDto;
import ca.bc.gov.oracleapi.dto.consep.ActivitySearchResponseDto;
import ca.bc.gov.oracleapi.entity.consep.ActivitySearchResultEntity;
import ca.bc.gov.oracleapi.repository.consep.ActivitySearchRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class ActivitySearchServiceTest {

  @Mock
  private ActivitySearchRepository activitySearchRepository;

  @InjectMocks
  private ActivitySearchService activitySearchService;

  private ActivitySearchRequestDto activitySearchRequestDto;
  private List<ActivitySearchResultEntity> activitySearchResults;
  private ActivitySearchResultEntity activitySearchResultEntityOne;
  private ActivitySearchResultEntity activitySearchResultEntityTwo;

  // Test data
  private List<String> lotNumbers;
  private String testType, activityId, requestId, requestType, orchardId, testCategoryCd, testRank,
      species, geneticClassCode, seedlotSample, riaComment, requestItem, pv, seedlotDisplaySeedlot,
      seedlotDisplayFamilylot;
  private Integer germinatorTrayId, requestYear, germTrayAssignment, completeStatus,
      acceptanceStatus, riaSkey, currentTestInd, germinationPct, moisturePct, purityPct,
      seedsPerGram, otherTestResult, significntStsInd, requestSkey;
  private LocalDate seedWithdrawalStartDate, seedWithdrawalEndDate, actualBeginDateFrom,
      actualBeginDateTo, actualEndDateFrom, actualEndDateTo, revisedStartDateFrom,
      revisedStartDateTo, revisedEndDateFrom, revisedEndDateTo;
  private LocalDateTime actualBeginDtTm, actualEndDtTm, seedWithdrawalDate, revisedEndDt;
  private Boolean includeHistoricalTests, germTestsOnly;

  @BeforeEach
  void setUp() {
    // Search filter parameters
    seedlotDisplaySeedlot = "00098";
    seedlotDisplayFamilylot = "F20082140146";
    lotNumbers = List.of(seedlotDisplaySeedlot, seedlotDisplayFamilylot);
    testType = "D1";
    activityId = "D1";
    germinatorTrayId = null;
    seedWithdrawalStartDate = LocalDate.of(1997, 10, 1); // seedWithdrawalDate
    seedWithdrawalEndDate = LocalDate.of(1998, 10, 31); // seedWithdrawalDate
    includeHistoricalTests = false;
    germTestsOnly = true;
    requestId = "RTS19981299A"; // reqId, itemId
    requestType = "RTS";
    requestYear = 1998;
    orchardId = null;
    testCategoryCd = "STD"; // testCategoryCd
    testRank = "A"; // testRank
    species = "PLI"; // species
    actualBeginDateFrom = LocalDate.of(1997, 10, 1); // actualBeginDtTm
    actualBeginDateTo = LocalDate.of(1997, 10, 10); // actualBeginDtTm
    actualEndDateFrom = LocalDate.of(1997, 11, 1); // actualEndDtTm
    actualEndDateTo = LocalDate.of(1997, 11, 10); // actualEndDtTm
    revisedStartDateFrom = LocalDate.of(1997, 10, 1);
    revisedStartDateTo = LocalDate.of(1997, 10, 10);
    revisedEndDateFrom = LocalDate.of(1997, 11, 1); // revisedEndDt
    revisedEndDateTo = LocalDate.of(1997, 11, 10); // revisedEndDt
    germTrayAssignment = -1; // assigned_tray_ind
    completeStatus = -1; // testCompleteInd
    acceptanceStatus = -1; // acceptResultInd
    geneticClassCode = "A";

    activitySearchRequestDto = new ActivitySearchRequestDto(
        lotNumbers, testType, activityId, germinatorTrayId,
        seedWithdrawalStartDate, seedWithdrawalEndDate,
        includeHistoricalTests, germTestsOnly, requestId, requestType,
        requestYear, orchardId, testCategoryCd, testRank, species,
        actualBeginDateFrom, actualBeginDateTo,
        actualEndDateFrom, actualEndDateTo,
        revisedStartDateFrom, revisedStartDateTo,
        revisedEndDateFrom, revisedEndDateTo,
        germTrayAssignment, completeStatus, acceptanceStatus, geneticClassCode
    );

    // Search return result
    requestItem = "RTS19981299A";
    currentTestInd = 0;
    germinationPct = 88;
    pv = "77//9";
    moisturePct = 0;
    purityPct = 0;
    seedsPerGram = 0;
    otherTestResult = 0;
    significntStsInd = -1;
    actualBeginDtTm = LocalDate.of(1998, 10, 8).atStartOfDay();
    actualEndDtTm = LocalDate.of(1998, 11, 6).atTime(LocalTime.MAX);
    seedWithdrawalDate = seedWithdrawalStartDate.atStartOfDay();
    revisedEndDt = revisedEndDateFrom.atStartOfDay();
    riaComment = "Comment";
    requestSkey = 44115;
    riaSkey = 448383;
    seedlotSample = "00098";

    activitySearchResults = new ArrayList<>();

    activitySearchResultEntityOne = new ActivitySearchResultEntity();
    activitySearchResultEntityOne.setSeedlotDisplay(seedlotDisplaySeedlot);
    populateCommonFields(activitySearchResultEntityOne);
    activitySearchResults.add(activitySearchResultEntityOne);

    activitySearchResultEntityTwo = new ActivitySearchResultEntity();
    activitySearchResultEntityTwo.setSeedlotDisplay(seedlotDisplayFamilylot);
    populateCommonFields(activitySearchResultEntityTwo);
    activitySearchResults.add(activitySearchResultEntityTwo);
  }

  private void populateCommonFields(ActivitySearchResultEntity entity) {
    entity.setRequestItem(requestItem);
    entity.setSpecies(species);
    entity.setActivityId(activityId);
    entity.setTestRank(testRank);
    entity.setCurrentTestInd(currentTestInd);
    entity.setTestCategoryCd(testCategoryCd);
    entity.setGerminationPct(germinationPct);
    entity.setPv(pv);
    entity.setMoisturePct(moisturePct);
    entity.setPurityPct(purityPct);
    entity.setSeedsPerGram(seedsPerGram);
    entity.setOtherTestResult(otherTestResult);
    entity.setTestCompleteInd(completeStatus == -1);
    entity.setAcceptResultInd(acceptanceStatus);
    entity.setSignificntStsInd(significntStsInd);
    entity.setSeedWithdrawalDate(seedWithdrawalDate);
    entity.setRevisedEndDt(revisedEndDt);
    entity.setActualBeginDtTm(actualBeginDtTm);
    entity.setActualEndDtTm(actualEndDtTm);
    entity.setRiaComment(riaComment);
    entity.setRequestSkey(requestSkey);
    entity.setReqId(requestId.substring(0, 11));
    entity.setItemId(requestId.length() >= 12 ? requestId.substring(11, 12) : "");
    entity.setSeedlotSample(seedlotSample);
    entity.setRiaSkey(riaSkey);
  }

  @Test
  void shouldReturnMappedResults() {
    Pageable pageable = PageRequest.of(0, 10);
    Page<ActivitySearchResultEntity> mockPage = new PageImpl<>(
        List.of(activitySearchResultEntityOne),
        pageable,
        1 // total elements
    );

    LocalDateTime expectedActualBeginFrom = actualBeginDateFrom.atStartOfDay();
    LocalDateTime expectedActualBeginTo   = actualBeginDateTo.atTime(LocalTime.MAX);
    LocalDateTime expectedActualEndFrom   = actualEndDateFrom.atStartOfDay();
    LocalDateTime expectedActualEndTo     = actualEndDateTo.atTime(LocalTime.MAX);
    LocalDateTime expectedSeedWithdrawalStartDate = seedWithdrawalStartDate.atStartOfDay();
    LocalDateTime expectedSeedWithdrawalEndDate   = seedWithdrawalEndDate.atTime(LocalTime.MAX);
    LocalDateTime expectedRevisedStartDateFrom   = revisedStartDateFrom.atStartOfDay();
    LocalDateTime expectedRevisedStartDateTo   = revisedStartDateTo.atTime(LocalTime.MAX);
    LocalDateTime expectedRevisedEndDateFrom   = revisedEndDateFrom.atStartOfDay();
    LocalDateTime expectedRevisedEndDateTo   = revisedEndDateTo.atTime(LocalTime.MAX);

    when(activitySearchRepository.searchTestingActivities(
        lotNumbers, testType, activityId, germinatorTrayId,
        expectedSeedWithdrawalStartDate, expectedSeedWithdrawalEndDate,
        includeHistoricalTests, germTestsOnly, requestId, requestType,
        requestYear, orchardId, testCategoryCd, testRank, species,
        expectedActualBeginFrom, expectedActualBeginTo,
        expectedActualEndFrom, expectedActualEndTo,
        expectedRevisedStartDateFrom, expectedRevisedStartDateTo,
        expectedRevisedEndDateFrom, expectedRevisedEndDateTo,
        germTrayAssignment, completeStatus, acceptanceStatus, geneticClassCode, pageable
    )).thenReturn(mockPage);

    ActivitySearchPageResponseDto pageResponse = activitySearchService.searchTestingActivities(
        activitySearchRequestDto, pageable
    );

    assertThat(pageResponse.content()).hasSize(1);
    assertThat(pageResponse.totalElements()).isEqualTo(1);
    assertThat(pageResponse.totalPages()).isEqualTo(1);
    assertThat(pageResponse.pageNumber()).isEqualTo(0);
    assertThat(pageResponse.pageSize()).isEqualTo(10);
    ActivitySearchResponseDto activitySearchResponseDto = pageResponse.content().get(0);
    assertThat(activitySearchResponseDto.seedlotDisplay()).isEqualTo(seedlotDisplaySeedlot);
    assertThat(activitySearchResponseDto.requestItem()).isEqualTo(requestItem);
    assertThat(activitySearchResponseDto.species()).isEqualTo(species);
    assertThat(activitySearchResponseDto.activityId()).isEqualTo(activityId);
    assertThat(activitySearchResponseDto.testRank()).isEqualTo(testRank);
    assertThat(activitySearchResponseDto.currentTestInd()).isEqualTo(currentTestInd);
    assertThat(activitySearchResponseDto.testCategoryCd()).isEqualTo(testCategoryCd);
    assertThat(activitySearchResponseDto.germinationPct()).isEqualTo(germinationPct);
    assertThat(activitySearchResponseDto.pv()).isEqualTo(pv);
    assertThat(activitySearchResponseDto.moisturePct()).isEqualTo(moisturePct);
    assertThat(activitySearchResponseDto.purityPct()).isEqualTo(purityPct);
    assertThat(activitySearchResponseDto.seedsPerGram()).isEqualTo(seedsPerGram);
    assertThat(activitySearchResponseDto.otherTestResult()).isEqualTo(otherTestResult);
    assertThat(activitySearchResponseDto.testCompleteInd()).isTrue();
    assertThat(activitySearchResponseDto.acceptResultInd()).isEqualTo(acceptanceStatus);
    assertThat(activitySearchResponseDto.significntStsInd()).isEqualTo(significntStsInd);
    assertThat(activitySearchResponseDto.seedWithdrawalDate()).isEqualTo(seedWithdrawalDate);
    assertThat(activitySearchResponseDto.revisedEndDt()).isEqualTo(revisedEndDt);
    assertThat(activitySearchResponseDto.actualBeginDtTm()).isEqualTo(actualBeginDtTm);
    assertThat(activitySearchResponseDto.actualEndDtTm()).isEqualTo(actualEndDtTm);
    assertThat(activitySearchResponseDto.riaComment()).isEqualTo(riaComment);
    assertThat(activitySearchResponseDto.requestSkey()).isEqualTo(requestSkey);
    assertThat(activitySearchResponseDto.reqId()).isEqualTo(requestId.substring(0, 11));
    assertThat(activitySearchResponseDto.itemId())
        .isEqualTo(requestId.length() >= 12 ? requestId.substring(11, 12) : "");
    assertThat(activitySearchResponseDto.seedlotSample()).isEqualTo(seedlotSample);
    assertThat(activitySearchResponseDto.riaSkey()).isEqualTo(riaSkey);

    verify(activitySearchRepository, times(1)).searchTestingActivities(
        lotNumbers, testType, activityId, germinatorTrayId,
        expectedSeedWithdrawalStartDate, expectedSeedWithdrawalEndDate,
        includeHistoricalTests, germTestsOnly, requestId, requestType,
        requestYear, orchardId, testCategoryCd, testRank, species,
        expectedActualBeginFrom, expectedActualBeginTo,
        expectedActualEndFrom, expectedActualEndTo,
        expectedRevisedStartDateFrom, expectedRevisedStartDateTo,
        expectedRevisedEndDateFrom, expectedRevisedEndDateTo,
        germTrayAssignment, completeStatus, acceptanceStatus, geneticClassCode, pageable
    );
  }

  @Test
  void shouldReturnAllResultsWhenNoFiltersProvided() {
    ActivitySearchRequestDto emptyRequest = new ActivitySearchRequestDto(
        null, null, null, null, null, null,
        null, null, null, null, null, null,
        null, null, null, null, null, null,
        null, null, null, null, null, null,
        null, null, null
    );

    Pageable pageable = PageRequest.of(0, 10);
    Page<ActivitySearchResultEntity> mockPage = new PageImpl<>(
        activitySearchResults,
        pageable,
        activitySearchResults.size() // total elements
    );

    // mock return 2 results
    when(activitySearchRepository.searchTestingActivities(
        null, null, null, null, null, null,
        null, null, null, null, null, null,
        null, null, null, null, null, null,
        null, null, null, null, null, null,
        null, null, null, pageable
    )).thenReturn(mockPage);

    List<ActivitySearchResponseDto> result = activitySearchService
        .searchTestingActivities(emptyRequest, pageable)
        .content();

    assertThat(result).hasSize(2);

    ActivitySearchResponseDto firstItem = result.get(0);
    ActivitySearchResponseDto secondItem = result.get(1);

    assertThat(firstItem.seedlotDisplay()).isEqualTo(seedlotDisplaySeedlot);
    assertThat(secondItem.seedlotDisplay()).isEqualTo(seedlotDisplayFamilylot);
  }


  @Test
  void shouldReturnEmptyListWhenNoResultsFound() {
    // filter by requestYear = 2025
    ActivitySearchRequestDto emptyRequest = new ActivitySearchRequestDto(
        null, null, null, null, null, null,
        null, null, null, null, 2025, null,
        null, null, null, null, null, null,
        null, null, null, null, null, null,
        null, null, null
    );

    Pageable pageable = PageRequest.of(0, 10);

    // mock empty page
    Page<ActivitySearchResultEntity> emptyPage = new PageImpl<>(
        Collections.emptyList(),
        pageable,
        0
    );

    when(activitySearchRepository.searchTestingActivities(
        null, null, null, null, null, null,
        null, null, null, null, 2025, null,
        null, null, null, null, null, null,
        null, null, null, null, null, null,
        null, null, null, pageable
    )).thenReturn(emptyPage);

    List<ActivitySearchResponseDto> result = activitySearchService
        .searchTestingActivities(emptyRequest, pageable).content();

    assertThat(result).isEmpty();
  }
}
