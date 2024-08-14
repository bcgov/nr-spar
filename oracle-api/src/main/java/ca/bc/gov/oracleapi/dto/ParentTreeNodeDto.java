package ca.bc.gov.oracleapi.dto;

import ca.bc.gov.oracleapi.config.SparLog;
import ca.bc.gov.oracleapi.entity.ParentTreeEntity;
import lombok.Getter;
import lombok.Setter;

/** This class represents a parent tree node. */
@Getter
@Setter
public class ParentTreeNodeDto {

  private final ParentTreeEntity value;
  private ParentTreeNodeDto femaleParent;
  private ParentTreeNodeDto maleParent;

  /**
   * Creates a Parent Tree Node.
   *
   * @param value The parent tree entity instance.
   */
  public ParentTreeNodeDto(ParentTreeEntity value) {
    this.value = value;
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

  private int getParentsMeanElevation(
      ParentTreeNodeDto current, ParentTreeNodeDto femaleNode, ParentTreeNodeDto maleNode) {
    if (current.value.getElevation() != null) {
      return current.value.getElevation();
    }
    int femaleElevation = 0;
    if (current.femaleParent != null) {
      femaleElevation =
          getParentsMeanElevation(
              current.femaleParent,
              current.femaleParent.femaleParent,
              current.femaleParent.maleParent);
    }
    int maleElevation = 0;
    if (current.maleParent != null) {
      maleElevation =
          getParentsMeanElevation(
              current.maleParent, current.maleParent.femaleParent, current.maleParent.maleParent);
    }
    if (maleElevation == 0 && femaleElevation > 0) {
      return femaleElevation;
    } else if (maleElevation > 0 && femaleElevation > 0) {
      int mean = (maleElevation + femaleElevation) / 2;
      return mean;
    }
    return 0;
  }

  /**
   * Get the parent tree mean elevation looking into parent trees family.
   *
   * @return an integer representing the mean elevation.
   */
  public int getParentTreeElevation() {
    int elevation = getParentsMeanElevation(this, this.femaleParent, this.maleParent);
    return elevation;
  }

  /**
   * Prints the current note.
   *
   * @param level Current level in the tree
   */
  public void print(int level) {
    String message = String.format("Level %d - %s", level, toString());
    SparLog.info(message);
    if (femaleParent != null) {
      femaleParent.print(level + 1);
    }
    if (maleParent != null) {
      maleParent.print(level + 1);
    }
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
