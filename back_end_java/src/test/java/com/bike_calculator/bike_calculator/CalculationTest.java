package com.bike_calculator.bike_calculator;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

class CalculationTest {

    @Test
    void testGetRatio() {
        List<Integer> sprockets = Arrays.asList(11, 12, 13);
        Cassette cassette = new Cassette("Test Cassette", sprockets);
        List<Integer> rings = Arrays.asList(34, 50);
        Crankset crankset = new Crankset("Test Crankset", rings);

        Calculation calc = new Calculation(cassette, crankset);
        List<List<Double>> result = calc.getRatio();

        assertEquals(2, result.size());
        assertEquals(3, result.get(0).size());
        assertEquals(34.0 / 11.0, result.get(0).get(0)); // 34/11
        assertEquals(50.0 / 13.0, result.get(1).get(2)); // 50/13
    }

    @Test
    void testGetRollout() {
        List<Integer> sprockets = Arrays.asList(11, 12);
        Cassette cassette = new Cassette("Test Cassette", sprockets);
        List<Integer> rings = Arrays.asList(34, 50);
        Crankset crankset = new Crankset("Test Crankset", rings);
        Tyre tyre = new Tyre("Test Tyre", 2000);

        Calculation calc = new Calculation(cassette, crankset, tyre);
        List<List<Double>> result = calc.getRollout();

        assertEquals(2, result.size());
        assertEquals(2, result.get(0).size());
        assertEquals((34.0 / 11.0) * 2000, result.get(0).get(0));
        assertEquals((50.0 / 12.0) * 2000, result.get(1).get(1));
    }

    @Test
    void testGetSpeed() {
        List<Integer> sprockets = Arrays.asList(11, 12);
        Cassette cassette = new Cassette("Test Cassette", sprockets);
        List<Integer> rings = Arrays.asList(34, 50);
        Crankset crankset = new Crankset("Test Crankset", rings);
        Tyre tyre = new Tyre("Test Tyre", 2000);
        List<Integer> cadences = Arrays.asList(60, 90);

        Calculation calc = new Calculation(cassette, crankset, tyre, cadences);
        List<List<Double>> result = calc.getSpeed();

        assertEquals(4, result.size());
        assertEquals(2, result.get(0).size());
        double ratio1 = 34.0 / 11.0;
        assertEquals(ratio1 * 60 * 2000 / 16670, result.get(0).get(0));
        double ratio4 = 50.0 / 12.0;
        assertEquals(ratio4 * 90 * 2000 / 16670, result.get(3).get(1));
    }
}
