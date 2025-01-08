package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.config.SparLog;
import ca.bc.gov.backendstartapi.dto.FavouriteActivityCreateDto;
import ca.bc.gov.backendstartapi.dto.FavouriteActivityUpdateDto;
import ca.bc.gov.backendstartapi.entity.FavouriteActivityEntity;
import ca.bc.gov.backendstartapi.exception.FavoriteActivityExistsToUser;
import ca.bc.gov.backendstartapi.exception.InvalidActivityException;
import ca.bc.gov.backendstartapi.repository.FavouriteActivityRepository;
import ca.bc.gov.backendstartapi.security.LoggedUserService;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

/** This class contains all routines and database access to a users' favorite activity. */
@Service
public class FavouriteActivityService {

  private FavouriteActivityRepository favouriteActivityRepository;

  private LoggedUserService loggedUserService;

  /**
   * Create a {@link FavouriteActivityService} instance.
   *
   * @param loggedUserService a {@link LoggedUserService} instance
   * @param favouriteActivityRepository a {@link FavouriteActivityRepository} instance
   */
  public FavouriteActivityService(
      LoggedUserService loggedUserService,
      FavouriteActivityRepository favouriteActivityRepository) {
    this.loggedUserService = loggedUserService;
    this.favouriteActivityRepository = favouriteActivityRepository;
  }

  /**
  * Validates the activity input.
  */
  private void validateActivityInput(FavouriteActivityCreateDto activityDto) {
    if (Objects.isNull(activityDto.activity()) || activityDto.activity().isBlank()) {
      throw new InvalidActivityException();
    }
  }

  /**
  * Builds a FavouriteActivityEntity.
  */
  private FavouriteActivityEntity buildFavouriteActivityEntity(
      String userId, FavouriteActivityCreateDto dto) {
    FavouriteActivityEntity entity = new FavouriteActivityEntity();
    entity.setUserId(userId);
    entity.setActivity(dto.activity());
    entity.setIsConsep(Optional.ofNullable(dto.isConsep()).orElse(false));
    return entity;
  }

  /**
   * Create a user's activity in the database.
   *
   * @param activityDtos a {@link FavouriteActivityCreateDto} containing the activity title
   * @return the {@link FavouriteActivityEntity} created
   */
  public List<FavouriteActivityEntity> createUserActivities(
    List<FavouriteActivityCreateDto> activityDtos) {
    String userId = loggedUserService.getLoggedUserId();
    SparLog.info("Creating activities for user {}", userId);

    List<FavouriteActivityEntity> createdActivities = new ArrayList<>();

    for (FavouriteActivityCreateDto dto : activityDtos) {
      try {
        validateActivityInput(dto);
        if (favouriteActivityRepository.existsByUserIdAndActivity(userId, dto.activity())) {
          continue;
        }
        FavouriteActivityEntity entity = buildFavouriteActivityEntity(userId, dto);
        createdActivities.add(favouriteActivityRepository.save(entity));
      } catch (InvalidActivityException | FavoriteActivityExistsToUser e) {
        SparLog.error("Error creating activity: {}", e.getMessage());
      }
    }
    return createdActivities;
  }

  /**
   * Retrieve all favorite activities to a specific user.
   *
   * @return a list of FavoriteActivityEntity or an empty list
   */
  public List<FavouriteActivityEntity> getAllUserFavoriteActivities() {
    String userId = loggedUserService.getLoggedUserId();
    SparLog.info("Retrieving all favorite activities for user {}", userId);

    List<FavouriteActivityEntity> list = favouriteActivityRepository.findAllByUserId(userId);
    SparLog.info("{} favourite activity(ies) for user {}", list.size(), userId);

    return list;
  }

  /**
   * Updates a user activity.
   *
   * @param id the {@link Long} value as the id of the activity to be updated
   * @param updateDto a {@link FavouriteActivityUpdateDto} containing the values to be updated
   * @return a {@link FavouriteActivityEntity} updated
   * @throws InvalidActivityException if the activity doesn't exist
   */
  @Transactional
  public FavouriteActivityEntity updateUserActivity(
      @NonNull Long id, FavouriteActivityUpdateDto updateDto) {
    String userId = loggedUserService.getLoggedUserId();

    SparLog.info("Updating activity id {} for user {}", id, userId);

    FavouriteActivityEntity activityEntity =
        favouriteActivityRepository.findById(id).orElseThrow(InvalidActivityException::new);

    if (updateDto.highlighted()) {
      favouriteActivityRepository.removeAllHighlightedByUser(userId);
    }

    activityEntity.setHighlighted(updateDto.highlighted());

    FavouriteActivityEntity activityEntitySaved = favouriteActivityRepository.save(activityEntity);
    SparLog.info("Activity id {} updated for user {}", id, userId);

    return activityEntitySaved;
  }

  /**
   * Deletes a user activity by the activity id number.
   *
   * @param id A {@link Long} value as the id of the activity
   */
  public void deleteUserActivity(@NonNull Long id) {
    String userId = loggedUserService.getLoggedUserId();

    SparLog.info("Deleting activity id {} for user {}", id, userId);
    Optional<FavouriteActivityEntity> activityEntity = favouriteActivityRepository.findById(id);
    if (activityEntity.isEmpty()) {
      throw new InvalidActivityException();
    }

    favouriteActivityRepository.deleteById(id);
    SparLog.info("Activity id {} deleted for user {}", id, userId);
  }
}
