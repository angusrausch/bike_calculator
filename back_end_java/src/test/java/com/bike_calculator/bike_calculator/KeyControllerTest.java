package com.bike_calculator.bike_calculator;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.web.client.RestTemplate;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class KeyControllerTest {

    @LocalServerPort
    private int port;

    @Value("${google.maps.key}")
    private String expectedKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @Test
    void testGetGoogleMapsKey() {
        String url = "http://localhost:" + port + "/api/get-google-maps-key";
        @SuppressWarnings("unchecked")
        Map<String, String> response = restTemplate.getForObject(url, Map.class);
        assertEquals(expectedKey, response.get("google_maps_key"));
    }
}
