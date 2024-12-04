package ca.bc.gov.backendstartapi.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Clock;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/** This class represents a user's favorite activity in the database. */
@Entity
@Getter
@Setter
@AllArgsConstructor
@Table(name = "favourite_activity")
@Schema(description = "An object representing a user's favourite activity in the database")
public class FavouriteActivityEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Schema(description = "The ID of the entity in the database, also the PK.", example = "42")
  private Long id;

  @Column(name = "user_id")
  @Schema(
      description = "The user ID. This value comes from the JWT Token, from the 'sub' claim.",
      example = "d1c0c0d1fab34a19816bb0a506ab705b@idir")
  private String userId;

  @Column(name = "activity", updatable = false)
  @Schema(
      description = "An activity or a page name the user can access or favourite",
      example = "My Seedlots")
  private String activity;

  @Column
  @Schema(
      description = "Defines if the favourite activity is highlighted on the dashboard",
      example = "false")
  private Boolean highlighted;

  @Column(name = "entry_timestamp", nullable = false, updatable = false)
  private LocalDateTime entryTimestamp;

  @Column(name = "update_timestamp")
  private LocalDateTime updateTimestamp;

  @Column(name = "is_consep", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
  @Schema(
      description = "Defines if the favourite activity is a CONSEP activity",
      example = "false")
  private Boolean isConsep = false;

  public FavouriteActivityEntity() {
    this.highlighted = false;
  }

  @PrePersist
  private void prePersist() {
    entryTimestamp = LocalDateTime.now(Clock.systemUTC());
    updateTimestamp = entryTimestamp;
  }

  @PreUpdate
  private void preUpdate() {
    updateTimestamp = LocalDateTime.now(Clock.systemUTC());
  }
}
