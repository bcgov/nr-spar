package ca.bc.gov.oracleapi.entity.projection;

/** This projection consists of a mix of joined column from various tables. */
public interface ParentTreePropsProj {

  Long getParentTreeId();

  String getParentTreeNumber();

  Character getTested();
}
