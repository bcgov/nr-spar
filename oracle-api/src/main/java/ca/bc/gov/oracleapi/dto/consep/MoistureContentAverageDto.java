import java.util.List;

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
