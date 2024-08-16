package ca.bc.gov.oracleapi.dto;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.entity.ParentTreeEntity;
import java.util.Optional;
import lombok.Getter;
import lombok.Setter;

/** This class represents a parent tree node. */
@Getter
@Setter
public class ParentTreeNodeDto {

  private final ParentTreeEntity value;
  private ParentTreeNodeDto femaleParent;
  private ParentTreeNodeDto maleParent;
  private ParentTreeGeoNodeDto geoNode;

  /**
   * Creates a Parent Tree Node.
   *
   * @param value The parent tree entity instance.
   */
  public ParentTreeNodeDto(ParentTreeEntity value) {
    this.value = value;
    this.geoNode = new ParentTreeGeoNodeDto(value);
  }

  /**
   * Add a parent tree node female or male.
   *
   * @param parentTreeId the reference parent id tree to look for.
   * @param entity the parent tree entity instance.
   */
  public void add(Long parentTreeId, ParentTreeEntity entity) {
    if (parentTreeId.equals(value.getFemaleParentTreeId())) {
      femaleParent = new ParentTreeNodeDto(entity);
    } else if (parentTreeId.equals(value.getMaleParentTreeId())) {
      maleParent = new ParentTreeNodeDto(entity);
    } else {
      if (femaleParent != null) {
        femaleParent.add(parentTreeId, entity);
      }
      if (maleParent != null) {
        maleParent.add(parentTreeId, entity);
      }
    }
  }

  /**
   * Get a Parent tree's parent elevation (and all lat and long mean values), recursively, looking
   * at parent's parent and finding the 'mean' value when required. The calculation piece of code
   * was brought exactly as is in SPR_GET_PT_GEOG.prc file on SPAR Legacy.
   *
   * @param current Current node in the tree
   * @param femaleNode Female parent node in the tree
   * @param maleNode Male parent node in the tree
   * @return A female node if female has data, or a new node with mean values from female and male.
   */
  private ParentTreeGeoNodeDto getParentsMeanElevation(
      ParentTreeNodeDto current, ParentTreeNodeDto femaleNode, ParentTreeNodeDto maleNode) {
    if (current.geoNode.getElevation() != null) {
      return current.geoNode;
    }
    ParentTreeGeoNodeDto femaleElevation = new ParentTreeGeoNodeDto();
    if (current.femaleParent != null) {
      femaleElevation =
          Optional.ofNullable(
                  getParentsMeanElevation(
                      current.femaleParent,
                      current.femaleParent.femaleParent,
                      current.femaleParent.maleParent))
              .orElse(new ParentTreeGeoNodeDto());
    }
    ParentTreeGeoNodeDto maleElevation = new ParentTreeGeoNodeDto();
    if (current.maleParent != null) {
      maleElevation =
          Optional.ofNullable(
                  getParentsMeanElevation(
                      current.maleParent,
                      current.maleParent.femaleParent,
                      current.maleParent.maleParent))
              .orElse(new ParentTreeGeoNodeDto());
    }
    if (maleElevation.getElevationIntVal() == 0 && femaleElevation.getElevationIntVal() > 0) {
      return femaleElevation;
    } else if (maleElevation.getElevationIntVal() > 0 && femaleElevation.getElevationIntVal() > 0) {
      int noOfParents = 2;
      ParentTreeGeoNodeDto meanNode = new ParentTreeGeoNodeDto();

      // Elevation
      int meanElevation =
          (maleElevation.getElevationIntVal() + femaleElevation.getElevationIntVal()) / noOfParents;
      meanNode.setElevation(meanElevation);

      // All other calculations (Lat and Long)
      int calc =
          (femaleElevation.getLatitudeDegreesIntVal() * 3600)
              + (femaleElevation.getLatitudeMinutesIntVal() * 60)
              + femaleElevation.getLatitudeSecondsIntVal();
      calc =
          calc
              + (maleElevation.getLatitudeDegreesIntVal() * 3600)
              + (maleElevation.getLatitudeMinutesIntVal() * 60)
              + maleElevation.getLatitudeSecondsIntVal();
      // --derive mean
      calc = calc / noOfParents;
      int latitudeDegrees = calc / 3600;
      meanNode.setLatitudeDegrees(latitudeDegrees);

      int buff = calc % 3600;
      int latitudeMinutes = buff / 60;
      meanNode.setLatitudeMinutes(latitudeMinutes);

      buff = calc % 60;
      int latitudeSeconds = buff;
      meanNode.setLatitudeSeconds(latitudeSeconds);

      calc =
          (femaleElevation.getLongitudeDegreesIntVal() * 3600)
              + (femaleElevation.getLongitudeMinutesIntVal() * 60)
              + femaleElevation.getLongitudeSecondsIntVal();
      calc =
          calc
              + (maleElevation.getLongitudeDegreesIntVal() * 3600)
              + (maleElevation.getLongitudeMinutesIntVal() * 60)
              + maleElevation.getLongitudeSecondsIntVal();
      // --derive mean
      calc = calc / noOfParents;
      int longitudeDegrees = calc / 3600;
      meanNode.setLongitudeDegrees(longitudeDegrees);

      buff = calc % 3600;
      int longitudeMinutes = buff / 60;
      meanNode.setLongitudeMinutes(longitudeMinutes);

      buff = calc % 60;
      int longitudeSeconds = buff;
      meanNode.setLongitudeSeconds(longitudeSeconds);

      return meanNode;
    }
    return null;
  }

  /**
   * Get the parent tree mean elevation looking into parent trees family.
   *
   * @return an integer representing the mean elevation.
   */
  public ParentTreeGeoNodeDto getParentTreeElevation() {
    ParentTreeGeoNodeDto elevation =
        getParentsMeanElevation(this, this.femaleParent, this.maleParent);
    return elevation;
  }

  /**
   * Prints the current note.
   *
   * @param level Current level in the tree
   */
  public String printLevel(int level) {
    String message = String.format("Level %d - %s", level, toString());
    SparLog.info(message);
    if (femaleParent != null) {
      return femaleParent.printLevel(level + 1);
    }
    if (maleParent != null) {
      return maleParent.printLevel(level + 1);
    }
    return message;
  }

  /** Gets the string version of the node. */
  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder("ParentTreeId=");
    sb.append(value.getId());
    sb.append(" (elev: ").append(value.getElevation()).append(") ");
    sb.append("[");
    boolean added = false;
    if (value.getFemaleParentTreeId() != null) {
      sb.append("femaleParentId=").append(value.getFemaleParentTreeId());
      added = true;
    }
    if (value.getMaleParentTreeId() != null) {
      if (added) {
        sb.append(", ");
      }
      sb.append("male=").append(value.getMaleParentTreeId());
    }
    sb.append("]");
    return sb.toString();
  }
}
