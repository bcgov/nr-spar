package ca.bc.gov.oracleapi.service.consep;

import org.junit.jupiter.api.Test;

import ca.bc.gov.oracleapi.dto.consep.AverageService;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class AverageServiceTest {

    private final AverageService averageService = new AverageService();

    @Test
    public void testCalculateAverage_ValidList() {
        // Arrange
        var numbers = Arrays.asList(1.0, 2.0, 3.0, 4.0, 5.0);

        // Act
        double result = averageService.calculateAverage(numbers);

        // Assert
        assertEquals(3.0, result, 0.001, "The average should be 3.0");
    }

    @Test
    public void testCalculateAverage_EmptyList() {
        // Arrange
        List<Double> numbers = Collections.emptyList();

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            averageService.calculateAverage(numbers);
        });

        assertEquals("The list of numbers cannot be null or empty", exception.getMessage());
    }

    @Test
    public void testCalculateAverage_NullList() {
        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            averageService.calculateAverage(null);
        });

        assertEquals("The list of numbers cannot be null or empty", exception.getMessage());
    }
}
