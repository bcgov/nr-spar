package ca.bc.gov.backendstartapi.config;

/** This class holds SPAR constants for a better grouping and organisation. */
public final class Constants {

  public static final Integer CLASS_A_SEEDLOT_NUM_MIN = 63000;
  public static final Integer CLASS_A_SEEDLOT_NUM_MAX = 69999;
  public static final Integer CLASS_A_COPY_MIN = 62000;
  public static final Integer CLASS_A_COPY_MAX = 62999;
  public static final Integer CLASS_B_COPY_MIN = 52000;
  public static final Integer CLASS_B_COPY_MAX = 52999;
  public static final Integer CLASS_B_SEEDLOT_NUM_MIN = 53000;
  public static final Integer CLASS_B_SEEDLOT_NUM_MAX = 59998;
  public static final String INCOMPLETE_SEEDLOT_STATUS = "INC";
  public static final String PENDING_SEEDLOT_STATUS = "PND";
  public static final String SUBMITTED_SEEDLOT_STATUS = "SUB";
  public static final String MINISTRY_OF_FORESTS_ID = "00012797";

  /** Feature class key for natural-stand collection area polygons (Oracle {@code spr_spatial_utils}). */
  public static final int FEATURE_CLASS_SKEY_COLL_AREA = 1;
}
