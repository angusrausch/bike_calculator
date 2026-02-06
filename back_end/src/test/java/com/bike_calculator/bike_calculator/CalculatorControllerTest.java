package com.bike_calculator.bike_calculator;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CalculatorControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private CassetteRepo cassetteRepo;

    @Autowired
    private CranksetRepo cranksetRepo;

    @Autowired
    private TyreRepo tyreRepo;

    private final RestTemplate restTemplate = new RestTemplate();

    @BeforeEach
    void setUp() {
        for (int i = 1; i <= 5; i++) {
            cassetteRepo.save(new Cassette("Cassette " + i, Arrays.asList(11 + i, 12 + i, 13 + i)));
            cranksetRepo.save(new Crankset("Crankset " + i, Arrays.asList(34 + i, 50 + i)));
            tyreRepo.save(new Tyre("Tyre " + i, 2000 + i * 10));
        }
    }

    @Test
    void testGetCassettes() {
        String url = "http://localhost:" + port + "/api/cassettes";
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> response = restTemplate.getForObject(url, List.class);
        assertNotNull(response);
        assertTrue(response.size() >= 5);
        assertEquals(cassetteRepo.findById(1L).get().getName(), response.get(0).get("name"));
        assertNotEquals(response.get(0).get("name"), response.get(1).get("name"));
    }

    @Test
    void testGetCassette() {
        String url = "http://localhost:" + port + "/api/cassettes/" + 1;
        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        assertNotNull(response);
        assertEquals(cassetteRepo.findById(1L).get().getName(), (String) response.get("name"));
    }

    @Test
    void testGetCranksets() {
        String url = "http://localhost:" + port + "/api/cranksets";
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> response = restTemplate.getForObject(url, List.class);
        assertNotNull(response);
        assertTrue(response.size() >= 5);
        assertEquals(cranksetRepo.findById(1L).get().getName(), response.get(0).get("name"));
        assertNotEquals(response.get(0).get("name"), response.get(1).get("name"));
    }

    @Test
    void testGetCrankset() {
        String url = "http://localhost:" + port + "/api/cranksets/" + 1;
        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        assertNotNull(response);
        assertEquals(cranksetRepo.findById(1L).get().getName(), (String) response.get("name"));
    }

    @Test
    void testGetTyres() {
        String url = "http://localhost:" + port + "/api/tyres";
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> response = restTemplate.getForObject(url, List.class);
        assertNotNull(response);
        assertTrue(response.size() >= 5);
        assertEquals(tyreRepo.findById(1L).get().getName(), response.get(0).get("name"));
        assertNotEquals(response.get(0).get("name"), response.get(1).get("name"));
    }

    @Test
    void testGetTyre() {
        String url = "http://localhost:" + port + "/api/tyres/" + 1;
        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        assertNotNull(response);
        assertEquals(tyreRepo.findById(1L).get().getName(), (String) response.get("name"));
    }

    @Test
    void testGetRatio() {
        Crankset crankset = cranksetRepo.findById(1L).get();
        Cassette cassette = cassetteRepo.findById(1L).get();

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString("http://localhost:" + port + "/api/calculate/ratio")
            .queryParam("crankset_id", crankset.getId())
            .queryParam("cassette_id", cassette.getId());
        String url = builder.toUriString();

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        assertNotNull(response);
        assertEquals(crankset.getRings(), response.get("chainrings"));
        assertEquals(cassette.getSprockets(), response.get("sprockets"));

        Calculation calc = new Calculation(cassette, crankset);
        List<List<Double>> result = calc.getRatio();
        assertEquals(result, response.get("results"));
    }

    @Test
    void testGetRollout() {
        Crankset crankset = cranksetRepo.findById(1L).get();
        Cassette cassette = cassetteRepo.findById(1L).get();
        Tyre tyre = tyreRepo.findById(1L).get();

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString("http://localhost:" + port + "/api/calculate/rollout")
            .queryParam("crankset_id", crankset.getId())
            .queryParam("cassette_id", cassette.getId())
            .queryParam("tyre_id", tyre.getId());
        String url = builder.toUriString();

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        assertNotNull(response);
        assertEquals(crankset.getRings(), response.get("chainrings"));
        assertEquals(cassette.getSprockets(), response.get("sprockets"));

        Calculation calc = new Calculation(cassette, crankset, tyre);
        List<List<Double>> result = calc.getRollout();
        assertEquals(result, response.get("results"));
    }

    @Test
    void testGetSpeed() {
        Crankset crankset = cranksetRepo.findById(1L).get();
        Cassette cassette = cassetteRepo.findById(1L).get();
        Tyre tyre = tyreRepo.findById(1L).get();
        int minCadence = 60;
        int maxCadence = 100;
        int cadenceInc = 10;

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString("http://localhost:" + port + "/api/calculate/speed")
            .queryParam("crankset_id", crankset.getId())
            .queryParam("cassette_id", cassette.getId())
            .queryParam("tyre_id", tyre.getId())
            .queryParam("min_cadence", minCadence)
            .queryParam("max_cadence", maxCadence)
            .queryParam("cadence_increment", cadenceInc);
        String url = builder.toUriString();

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        assertNotNull(response);
        assertEquals(crankset.getRings(), response.get("chainrings"));
        assertEquals(cassette.getSprockets(), response.get("sprockets"));

        List<Integer> cadenceList = new ArrayList<>();
        for (int i = minCadence; i <= maxCadence; i += cadenceInc) {
            cadenceList.add(i);
        }
        assertEquals(cadenceList, response.get("cadences"));

        Calculation calc = new Calculation(cassette, crankset, tyre, cadenceList);
        List<List<Double>> result = calc.getSpeed();
        assertEquals(result, response.get("results"));
    }

    @Test
    void testGetManualRatio() {
        // All three controllers use the same methods for manual cassette/crankset conversions. Only one test required
        List<Integer> sprockets = Arrays.asList(10, 12);
        Cassette cassette = new Cassette("Test Cassette", sprockets);
        List<Integer> rings = Arrays.asList(20, 24);
        Crankset crankset = new Crankset("Test Crankset", rings);

        String manualChainring = rings.stream().map(String::valueOf).collect(Collectors.joining(","));
        String manualCassette = sprockets.stream().map(String::valueOf).collect(Collectors.joining(","));

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString("http://localhost:" + port + "/api/calculate/ratio")
            .queryParam("manual_chainring", manualChainring)
            .queryParam("manual_cassette", manualCassette);
        String url = builder.toUriString();

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        assertNotNull(response);
        assertEquals(crankset.getRings(), response.get("chainrings"));
        assertEquals(cassette.getSprockets(), response.get("sprockets"));

        Calculation calc = new Calculation(cassette, crankset);
        List<List<Double>> result = calc.getRatio();
        assertEquals(result, response.get("results"));
    }
}
