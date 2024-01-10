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
import java.util.List;
import java.util.Objects;
import java.util.Optional;
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
   * Create a user's activity in the database.
   *
   * @param activityDto a {@link FavouriteActivityCreateDto} containing the activity title
   * @return the {@link FavouriteActivityEntity} created
   */
  public FavouriteActivityEntity createUserActivity(FavouriteActivityCreateDto activityDto) {
    String userId = loggedUserService.getLoggedUserId();
    SparLog.info("Creating activity {} for user {}", activityDto.activity(), userId);

    if (Objects.isNull(activityDto.activity()) || activityDto.activity().isBlank()) {
      throw new InvalidActivityException();
    }

    List<FavouriteActivityEntity> userFavList = favouriteActivityRepository.findAllByUserId(userId);
    if (userFavList.stream().anyMatch(ac -> ac.getActivity().equals(activityDto.activity()))) {
      SparLog.info("Activity {} already exists for user {}!", activityDto.activity(), userId);
      throw new FavoriteActivityExistsToUser();
    }

    FavouriteActivityEntity activityEntity = new FavouriteActivityEntity();
    activityEntity.setUserId(userId);
    activityEntity.setActivity(activityDto.activity());
    return favouriteActivityRepository.save(activityEntity);
  }

  /**
   * Retrieve all favorite activities to a specific user.
   *
   * @return a list of FavoriteActivityEntity or an empty list
   */
  public List<FavouriteActivityEntity> getAllUserFavoriteActivities() {
    String userId = loggedUserService.getLoggedUserId();
    SparLog.info("Retrieving all favorite activities for user {}", userId);
    return favouriteActivityRepository.findAllByUserId(userId);
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
  public FavouriteActivityEntity updateUserActivity(Long id, FavouriteActivityUpdateDto updateDto) {
    String userId = loggedUserService.getLoggedUserId();

    SparLog.info("Updating activity id {} for user {}", id, userId);

    FavouriteActivityEntity activityEntity =
        favouriteActivityRepository.findById(id).orElseThrow(InvalidActivityException::new);

    if (updateDto.highlighted()) {
      favouriteActivityRepository.removeAllHighlightedByUser(userId);
    }

    FavouriteActivityEntity entity = activityEntity.withHighlighted(updateDto.highlighted());

    return favouriteActivityRepository.save(entity);
  }

  /**
   * Deletes a user activity by the activity id number.
   *
   * @param id A {@link Long} value as the id of the activity
   */
  public void deleteUserActivity(Long id) {
    String userId = loggedUserService.getLoggedUserId();

    SparLog.info("Deleting activity id {} for user {}", id, userId);
    Optional<FavouriteActivityEntity> activityEntity = favouriteActivityRepository.findById(id);
    if (activityEntity.isEmpty()) {
      throw new InvalidActivityException();
    }

    favouriteActivityRepository.deleteById(id);
  }
}
