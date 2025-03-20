import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

public class Numbers {
    private List<Double> numbers;

    public Numbers(List<Double> numbers) {
        this.numbers = numbers;
    }

    public List<Double> getNumbers() {
        return numbers;
    }

    public void setNumbers(List<Double> numbers) {
        this.numbers = numbers;
    }
}

/** This class calculateas the average. */
public class AverageService {
  public double calculateAverage(List<Double> numbers) {
      if (numbers.isEmpty()) {
          throw new RuntimeException("Cannot calculate average of empty list");
      }
      return numbers.stream().mapToDouble(Double::doubleValue).average().orElse(0);
  }
}

@RestController
public class AverageController {
    private final AverageService averageService;

    @Autowired
    public AverageController(AverageService averageService) {
        this.averageService = averageService;
    }

    @PostMapping("/calculate-average")
    public ResponseEntity<Double> calculateAverage(@RequestBody Numbers numbers) {
        try {
            double average = averageService.calculateAverage(numbers.getNumbers());
            return ResponseEntity.status(HttpStatus.OK).body(average);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
