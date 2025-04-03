package ca.bc.gov.oracleapi.dto.consep;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

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
