package ca.bc.gov.backendstartapi.entity.projection;

/**
 * The projection used to get parent tree id and parent tree number from the ParentTree Repository.
 */
public interface ParentTreeIdNumberProj {
  Long getParentTreeId();

  String getParentTreeNumber();

  String getOrchardId();

  Long getSpu();

  void setParentTreeId(Long parentTreeId);

  void setParentTreeNumber(String parentTreeNumber);

  void setOrchardId(String orchardId);

  void setSpu(Long spu);
}
