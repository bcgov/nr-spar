package ca.bc.gov.oracleapi.entity.projection;

import java.math.BigDecimal;

/** This projection consists of a mix of joined column from various tables. */
public interface ParentTreeProj {
  Long getParentTreeId();

  String getParentTreeNumber();

  String getOrchardId();

  Long getSpu();

  Character getTested();

  String getGeneticTypeCode();

  String getGeneticWorthCode();

  BigDecimal getGeneticQualityValue();

  void setParentTreeId(Long parentTreeId);

  void setParentTreeNumber(String parentTreeNumber);

  void setOrchardId(String orchardId);

  void setSpu(Long spu);

  void setTested(Character tested);

  void setGeneticTypeCode(String geneticTypeCode);

  void setGeneticWorthCode(String geneticWorthCode);

  void setGeneticQualityValue(BigDecimal geneticQualityValue);
}
