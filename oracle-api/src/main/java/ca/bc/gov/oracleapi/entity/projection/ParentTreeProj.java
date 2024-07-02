package ca.bc.gov.oracleapi.entity.projection;

/** This projection consists of a mix of joined column from various tables. */
public interface ParentTreeProj {
  Long getParentTreeId();

  String getParentTreeNumber();

  String getOrchardId();

  Long getSpu();

  void setParentTreeId(Long parentTreeId);

  void setParentTreeNumber(String parentTreeNumber);

  void setOrchardId(String orchardId);

  void setSpu(Long spu);
}
