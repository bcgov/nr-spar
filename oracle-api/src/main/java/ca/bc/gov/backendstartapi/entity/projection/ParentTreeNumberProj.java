package ca.bc.gov.backendstartapi.entity.projection;

/**
 * The projection used to get parent tree id and parent tree number from the ParentTree Repository.
 */
public interface ParentTreeNumberProj {
  Long getId();

  String getNumber();

  void setId(Long id);

  void setNumber(String number);
}
