package ca.bc.gov.backendstartapi.repository;

import ca.bc.gov.backendstartapi.entity.FavouriteActivityEntity;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.jdbc.Sql;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@TestMethodOrder(OrderAnnotation.class)
class FavouriteActivityRepositoryTest {

  @Autowired private FavouriteActivityRepository favouriteActivityRepository;

  private static final String USER_ID = "123456789123456789@idir";

  @Test
  @DisplayName("createWithDefaultValuesTest")
  @Order(1)
  void createWithDefaultValuesTest() {
    FavouriteActivityEntity activity = new FavouriteActivityEntity();
    activity.setUserId(USER_ID);
    activity.setActivity("SEEDLOT_REGISTRATION");
    FavouriteActivityEntity created = favouriteActivityRepository.save(activity);

    Assertions.assertEquals(1L, created.getId());
    Assertions.assertEquals(USER_ID, created.getUserId());
    Assertions.assertEquals("SEEDLOT_REGISTRATION", created.getActivity());
    Assertions.assertFalse(created.getHighlighted());
    Assertions.assertNotNull(created.getEntryTimestamp());
    Assertions.assertNotNull(created.getUpdateTimestamp());
  }

  @Test
  @DisplayName("createWithAllValuesTest")
  @Order(2)
  void createWithAllValuesTest() {
    FavouriteActivityEntity activity = new FavouriteActivityEntity();
    activity.setUserId(USER_ID);
    activity.setActivity("CREATE_A_CLASS_SEEDLOT");
    activity.setHighlighted(true);
    FavouriteActivityEntity created = favouriteActivityRepository.save(activity);

    Assertions.assertEquals("CREATE_A_CLASS_SEEDLOT", created.getActivity());
    Assertions.assertEquals(USER_ID, created.getUserId());
    Assertions.assertTrue(created.getHighlighted());
    Assertions.assertNotNull(created.getEntryTimestamp());
    Assertions.assertNotNull(created.getUpdateTimestamp());
  }

  @Test
  @DisplayName("findAllByUserTest")
  @Order(3)
  @Sql(scripts = {"classpath:sql_scripts/FavoriteActivityRepositoryTest_favorite.sql"})
  void findAllByUserIdTest() {
    List<FavouriteActivityEntity> allByUser = favouriteActivityRepository.findAllByUserId(USER_ID);
    Assertions.assertFalse(allByUser.isEmpty());
    Assertions.assertEquals(2, allByUser.size());
  }

  @Test
  @DisplayName("updateActivityTest")
  @Order(4)
  @Sql(scripts = {"classpath:sql_scripts/FavoriteActivityRepositoryTest_favorite.sql"})
  void updateActivityTest() {
    Optional<FavouriteActivityEntity> getOne =
        favouriteActivityRepository.findByActivity("SEEDLOT_REGISTRATION");
    Assertions.assertTrue(getOne.isPresent());

    FavouriteActivityEntity activity = getOne.get();
    Assertions.assertEquals(USER_ID, activity.getUserId());
    Assertions.assertEquals("SEEDLOT_REGISTRATION", activity.getActivity());
    Assertions.assertFalse(activity.getHighlighted());

    activity.setHighlighted(Boolean.TRUE);
    FavouriteActivityEntity saved = favouriteActivityRepository.save(activity);

    Long activityId = activity.getId();
    Assertions.assertEquals(activityId, saved.getId());
    Assertions.assertEquals(USER_ID, saved.getUserId());
    Assertions.assertEquals("SEEDLOT_REGISTRATION", saved.getActivity());
    Assertions.assertTrue(saved.getHighlighted());
    Assertions.assertNotNull(saved.getEntryTimestamp());
    Assertions.assertNotNull(saved.getUpdateTimestamp());
  }

  @Test
  @DisplayName("deleteActivityTest")
  @Order(5)
  @Sql(scripts = {"classpath:sql_scripts/FavoriteActivityRepositoryTest_favorite.sql"})
  void deleteActivityTest() {
    Optional<FavouriteActivityEntity> getOne =
        favouriteActivityRepository.findByActivity("SEEDLOT_REGISTRATION");
    Assertions.assertTrue(getOne.isPresent());

    favouriteActivityRepository.delete(getOne.get());

    Optional<FavouriteActivityEntity> removed =
        favouriteActivityRepository.findByActivity("SEEDLOT_REGISTRATION");
    Assertions.assertTrue(removed.isEmpty());
  }
}
