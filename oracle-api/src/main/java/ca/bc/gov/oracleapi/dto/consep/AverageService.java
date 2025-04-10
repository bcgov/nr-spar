package ca.bc.gov.oracleapi.dto.consep;

import java.util.List;

import org.springframework.stereotype.Service;

/** This class calculateas the average. */
@Service
public class AverageService {
  public double calculateAverage(List<Double> numbers) {
    if (numbers == null || numbers.isEmpty()) {
        throw new IllegalArgumentException("The list of numbers cannot be null or empty");
    }
      return numbers.stream().mapToDouble(Double::doubleValue).average().orElse(0);
  }
}
