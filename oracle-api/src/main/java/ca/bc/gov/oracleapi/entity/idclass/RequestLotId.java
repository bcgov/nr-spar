package ca.bc.gov.oracleapi.entity.idclass;

import java.io.Serializable;
import java.util.Objects;

public class RequestLotId implements Serializable {
  private Long requestSkey;
  private String itemId;

  public RequestLotId() {}

  public RequestLotId(Long requestSkey, String itemId) {
    this.requestSkey = requestSkey;
    this.itemId = itemId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    RequestLotId that = (RequestLotId) o;
    return Objects.equals(requestSkey, that.requestSkey)
        && Objects.equals(itemId, that.itemId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(requestSkey, itemId);
  }
}
