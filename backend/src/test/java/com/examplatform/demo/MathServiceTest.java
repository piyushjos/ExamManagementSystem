package com.examplatform.demo;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class MathServiceTest {
    private final MathService svc = new MathService();
    @Test
    void add_returnsSum() {
        assertEquals(5, svc.add(2, 3));
    }

    @Test
    void divide_returnsQuotient() {
        assertEquals(2, svc.divide(6, 3));
    }

    @Test
    void divide_throwsOnZeroDivisor() {
        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class, () -> svc.divide(6, 0));
        assertTrue(ex.getMessage().contains("zero"));
    }


}
