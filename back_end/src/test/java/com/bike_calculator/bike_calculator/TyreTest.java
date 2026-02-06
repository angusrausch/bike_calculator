package com.bike_calculator.bike_calculator;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class TyreTest {

    @Autowired
    private TyreRepo tyreRepo;

    @Test
    void testTyreAttributes() {
        int circumference = 2100;
        String name = "Test Tyre";
        Tyre tyre = new Tyre(name, circumference);

        assertEquals(tyre.getCircumference(), circumference);
        assertEquals(tyre.getName(), name);
    }

    @Test
    void testSaveTyre() {
        int circumference = 2100;
        String name = "Test Tyre";
        Tyre tyre = new Tyre(name, circumference);
        Tyre savedTyre = tyreRepo.save(tyre);

        assertNotNull(savedTyre.getId());
        assertEquals(name, savedTyre.getName());
        assertEquals(circumference, savedTyre.getCircumference());
    }

    @Test
    void testEmtpyCassette() {
        Tyre tyre = new Tyre();

        assertNull(tyre.getName());
        assertEquals(tyre.getCircumference(), 0);
    }
}
