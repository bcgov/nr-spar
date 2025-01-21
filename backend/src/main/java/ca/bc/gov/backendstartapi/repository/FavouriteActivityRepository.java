package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.FavouriteActivityEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

/** This class represents a user's favorite activity repository. */
public interface FavouriteActivityRepository extends CrudRepository<FavouriteActivityEntity, Long> {

  List<FavouriteActivityEntity> findAllByUserId(String userId);

  Optional<FavouriteActivityEntity> findByActivity(String activity);

  boolean existsByUserIdAndActivity(String userId, String activity);

  @Modifying
  @Query("update FavouriteActivityEntity set highlighted = false where userId = ?1")
  void removeAllHighlightedByUser(String userId);
}
