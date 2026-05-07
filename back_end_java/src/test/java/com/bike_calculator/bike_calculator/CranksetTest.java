package com.bike_calculator.bike_calculator;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class CranksetTest {

    @Autowired
    private CranksetRepo cranksetRepo;

    @Test
    void testCranksetAttributes() {
        List<Integer> rings = Arrays.asList(34,50);
        String name = "Test Crankset";
        Crankset crankset = new Crankset(name, rings);

        assertEquals(crankset.getRings(), rings);
        assertEquals(crankset.getSpeed(), rings.size());
        assertEquals(crankset.getName(), name);
    }

    @Test
    void testSaveCrankset() {
        List<Integer> rings = Arrays.asList(34,50);
        String name = "Test Crankset";
        Crankset crankset = new Crankset(name, rings);
        Crankset savedCrankset = cranksetRepo.save(crankset);

        assertNotNull(savedCrankset.getId());
        assertEquals(name, savedCrankset.getName());
        assertEquals(rings, savedCrankset.getRings());
    }

    @Test
    void testEmtpyCrankset() {
        Crankset crankset = new Crankset();

        assertNull(crankset.getName());
        assertNull(crankset.getRings());
        assertEquals(crankset.getSpeed(), 0);
    }
}
