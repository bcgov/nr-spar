import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.Objects;

public class HealthCheck {

  public static void main(String[] args) throws IOException, InterruptedException {
    var client = HttpClient.newHttpClient();

    String port = System.getenv("SERVER_PORT");
    if (Objects.isNull(port)) {
      port = "8090";
    }

    var request = HttpRequest.newBuilder()
            .uri(URI.create("http://localhost:"+port+"/actuator/health"))
            .header("accept", "application/json")
            .build();

    var response = client.send(request, BodyHandlers.ofString());

    if (response.statusCode() != 200 || !response.body().matches("^\\{\"status\":\"UP\".*")) {
      throw new RuntimeException("Healthcheck failed");
    }
  }
}
