package ca.bc.gov.backendstartapi.endpoint;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ca.bc.gov.backendstartapi.entity.FavouriteActivityEntity;
import ca.bc.gov.backendstartapi.exception.FavoriteActivityExistsToUser;
import ca.bc.gov.backendstartapi.exception.InvalidActivityException;
import ca.bc.gov.backendstartapi.service.FavouriteActivityService;
import java.util.List;
import java.util.Objects;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(FavouriteActivityEndpoint.class)
@WithMockUser(username = "SPARTest", roles = "SPAR_NONMINISTRY_ORCHARD")
class FavouriteActivityEndpointTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private FavouriteActivityService favouriteActivityService;

  private static final String API_PATH = "/api/favourite-activities";

  private static final String CONTENT_HEADER = "Content-Type";

  private static final String JSON = "application/json";

  private String stringifyCreate(String activity) {
    StringBuilder json = new StringBuilder("{");
    if (!Objects.isNull(activity)) {
      json.append("\"activity\":\"").append(activity).append("\"");
    }
    json.append("}");
    return json.toString();
  }

  private FavouriteActivityEntity createEntity(String activity) {
    FavouriteActivityEntity activityEntity = new FavouriteActivityEntity();
    activityEntity.setActivity(activity);
    activityEntity.setHighlighted(Boolean.FALSE);
    return activityEntity;
  }

  @Test
  @DisplayName("createFavoriteActivitySuccessTest")
  void createFavoriteActivitySuccessTest() throws Exception {
    String content = "[{\"activity\":\"CREATE_A_CLASS_SEEDLOT\"}]";
    FavouriteActivityEntity activityEntity = createEntity("CREATE_A_CLASS_SEEDLOT");
    when(favouriteActivityService.createUserActivities(any())).thenReturn(List.of(activityEntity));

    mockMvc
        .perform(
            post(API_PATH)
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(content))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$[0].activity").value("CREATE_A_CLASS_SEEDLOT"))
        .andExpect(jsonPath("$[0].highlighted").value("false"))
        .andReturn();
  }

  @Test
  @DisplayName("createFavoriteActivityNotFoundTest")
  void createFavoriteActivityNotFoundTest() throws Exception {
    when(favouriteActivityService.createUserActivities(any()))
        .thenThrow(new InvalidActivityException());

    mockMvc
        .perform(
            post(API_PATH)
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(stringifyCreate(null)))
        .andExpect(status().isBadRequest())
        .andReturn();
  }

  @Test
  @DisplayName("createFavoriteActivityDuplicatedTest")
  void createFavoriteActivityDuplicatedTest() throws Exception {
    String content = "[{\"activity\":\"CREATE_A_CLASS_SEEDLOT\"}]";
    FavouriteActivityEntity activityEntity = createEntity("CREATE_A_CLASS_SEEDLOT");
    when(favouriteActivityService.createUserActivities(any())).thenReturn(List.of(activityEntity));

    mockMvc
        .perform(
            post(API_PATH)
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(content))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$[0].activity").value("CREATE_A_CLASS_SEEDLOT"))
        .andExpect(jsonPath("$[0].highlighted").value("false"))
        .andReturn();

    when(favouriteActivityService.createUserActivities(any()))
        .thenThrow(new FavoriteActivityExistsToUser());

    mockMvc
        .perform(
            post(API_PATH)
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(content))
        .andExpect(status().isBadRequest())
        .andReturn();
  }

  @Test
  @DisplayName("getAllUsersActivityTest")
  void getAllUsersActivityTest() throws Exception {

    FavouriteActivityEntity activityEntityOne = createEntity("CREATE_A_CLASS_SEEDLOT");
    FavouriteActivityEntity activityEntityTwo = createEntity("SEEDLOT_REGISTRATION");
    activityEntityTwo.setHighlighted(Boolean.TRUE);
    List<FavouriteActivityEntity> favoriteActivityEntities =
        List.of(activityEntityOne, activityEntityTwo);
    when(favouriteActivityService.getAllUserFavoriteActivities())
        .thenReturn(favoriteActivityEntities);
    mockMvc
        .perform(
            get(API_PATH)
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].activity").value("CREATE_A_CLASS_SEEDLOT"))
        .andExpect(jsonPath("$[0].highlighted").value("false"))
        .andExpect(jsonPath("$[1].activity").value("SEEDLOT_REGISTRATION"))
        .andExpect(jsonPath("$[1].highlighted").value("true"))
        .andReturn();
  }

  @Test
  @DisplayName("updateUserFavoriteActivity")
  void updateUserFavoriteActivity() throws Exception {
    String content = "[{\"activity\":\"EXISTING_SEEDLOTS\"}]";
    FavouriteActivityEntity activityEntity = createEntity("EXISTING_SEEDLOTS");
    activityEntity.setId(10000L);
    when(favouriteActivityService.createUserActivities(any())).thenReturn(List.of(activityEntity));

    mockMvc
        .perform(
            post(API_PATH)
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(content))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$[0].activity").value("EXISTING_SEEDLOTS"))
        .andExpect(jsonPath("$[0].highlighted").value("false"))
        .andReturn();

    activityEntity.setHighlighted(true);

    when(favouriteActivityService.updateUserActivity(any(), any())).thenReturn(activityEntity);

    String stringifyUpdate = "{\"highlighted\":\"true\",\"enabled\":\"true\"}";

    mockMvc
        .perform(
            patch(API_PATH + "/{id}", activityEntity.getId())
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(stringifyUpdate))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.activity").value("EXISTING_SEEDLOTS"))
        .andExpect(jsonPath("$.highlighted").value("true"))
        .andReturn();
  }

  @Test
  @DisplayName("deleteUserFavoriteActivity")
  void deleteUserFavoriteActivity() throws Exception {
    String content = "[{\"activity\":\"EXISTING_SEEDLOTS\"}]";
    FavouriteActivityEntity activityEntity = createEntity("EXISTING_SEEDLOTS");
    activityEntity.setId(10000L);

    when(favouriteActivityService.createUserActivities(any())).thenReturn(List.of(activityEntity));

    mockMvc
        .perform(
            post(API_PATH)
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(content))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$[0].activity").value("EXISTING_SEEDLOTS"))
        .andExpect(jsonPath("$[0].highlighted").value("false"))
        .andReturn();

    activityEntity.setHighlighted(true);

    doNothing().when(favouriteActivityService).deleteUserActivity(any());

    mockMvc
        .perform(
            delete(API_PATH + "/{id}", activityEntity.getId())
                .with(csrf().asHeader())
                .header(CONTENT_HEADER, JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andReturn();
  }
}
