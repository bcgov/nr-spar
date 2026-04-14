package ca.bc.gov.backendstartapi.entity;

import ca.bc.gov.backendstartapi.entity.idclass.SearchCriteriaId;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Clock;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Stores saved search filter criteria per user and page. */
@Entity
@Table(name = "search_criteria")
@IdClass(SearchCriteriaId.class)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@Getter
@Setter
@Schema(description = "Saved search filter criteria for a user on a specific page")
public class SearchCriteriaEntity {

  @Id
  @Column(name = "user_id", length = 30)
  @Schema(description = "The user ID of the logged-in user", example = "JDOE")
  private String userId;

  @Id
  @Column(name = "page_id", length = 100)
  @Schema(description = "The page ID for which criteria are saved", example = "SEEDLOT_SEARCH")
  private String pageId;

  @Column(name = "criteria_json", nullable = false, columnDefinition = "TEXT")
  @Schema(description = "Saved criteria as JSON", example = "{\"status\":\"active\"}")
  private String criteriaJson;

  @Column(name = "update_timestamp", nullable = false)
  private LocalDateTime updateTimestamp;

  @Column(name = "revision_count", nullable = false)
  @Version
  @Setter(AccessLevel.NONE)
  private int revisionCount;

  public SearchCriteriaEntity(String userId, String pageId, String criteriaJson) {
    this.userId = userId;
    this.pageId = pageId;
    this.criteriaJson = criteriaJson;
  }

  @PrePersist
  private void prePersist() {
    updateTimestamp = LocalDateTime.now(Clock.systemUTC());
  }

  @PreUpdate
  private void preUpdate() {
    updateTimestamp = LocalDateTime.now(Clock.systemUTC());
  }
}
