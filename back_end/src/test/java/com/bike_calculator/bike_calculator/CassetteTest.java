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
class CassetteTest {

    @Autowired
    private CassetteRepo cassetteRepo;

    @Test
    void testCassetteAttributes() {
        List<Integer> sprockets = Arrays.asList(11, 12, 13);
        String name = "Test Cassette";
        Cassette cassette = new Cassette(name, sprockets);

        assertEquals(cassette.getSprockets(), sprockets);
        assertEquals(cassette.getSpeed(), sprockets.size());
        assertEquals(cassette.getName(), name);
    }

    @Test
    void testSaveCassette() {
        List<Integer> sprockets = Arrays.asList(11, 12, 13);
        String name = "Test Cassette";
        Cassette cassette = new Cassette(name, sprockets);
        Cassette savedCassette = cassetteRepo.save(cassette);

        assertNotNull(savedCassette.getId());
        assertEquals(name, savedCassette.getName());
        assertEquals(sprockets, savedCassette.getSprockets());
    }

    @Test
    void testEmtpyCassette() {
        Cassette cassette = new Cassette();

        assertNull(cassette.getName());
        assertNull(cassette.getSprockets());
        assertEquals(cassette.getSpeed(), 0);
    }
}
