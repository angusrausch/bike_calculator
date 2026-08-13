package com.bike_calculator.bike_calculator;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class HealthControllerTest {

    @LocalServerPort
    private int port;

    @Autowired(required = false)
    private TestRestTemplate restTemplate;

    @BeforeEach
    void setUp() {
        if (restTemplate == null) {
            restTemplate = new TestRestTemplate();
        }
    }

    @Test
    void testGetHealth() {
        String url = "http://localhost:" + port + "/health";
        @SuppressWarnings("unchecked")
        ResponseEntity<List> responseEntity = restTemplate.getForEntity(url, List.class);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        List<Map<String, Object>> response = responseEntity.getBody();
    }
}
