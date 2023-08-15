package ca.bc.gov.backendstartapi.service;

import ca.bc.gov.backendstartapi.dto.GameticMethodologyDto;
import ca.bc.gov.backendstartapi.repository.GameticMethodologyRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/** This class contains all routines and database access to a list of gametic methodology. */
@Slf4j
@Service
public class GameticMethodologyService {
  private GameticMethodologyRepository gameticMethodologyRepository;

  public GameticMethodologyService(GameticMethodologyRepository gameticMethodologyRepository) {
    this.gameticMethodologyRepository = gameticMethodologyRepository;
  }

  /** Fetch all valid gametic methodologies from the repository. */
  public List<GameticMethodologyDto> getAllGameticMethodologies() {
    log.info("Fetching Gametic Methodologies");
    List<GameticMethodologyDto> resultList = new ArrayList<>();
    gameticMethodologyRepository.findAll().stream()
        .filter(method -> method.isValid())
        .forEach(
            method -> {
              GameticMethodologyDto methodToAdd =
                  new GameticMethodologyDto(
                      method.getGameticMethodologyCode(),
                      method.getDescription(),
                      method.isFemaleMethodology(),
                      method.isPliSpecies());
              resultList.add(methodToAdd);
            });

    return resultList;
  }
}
