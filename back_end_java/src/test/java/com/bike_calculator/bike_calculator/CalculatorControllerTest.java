package com.bike_calculator.bike_calculator;

import java.util.ArrayList;
import java.util.Arrays;
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
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @Autowired(required = false)
    private TestRestTemplate restTemplate;

    @BeforeEach
    void setUp() {
        if (restTemplate == null) {
            restTemplate = new TestRestTemplate();
        }
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
        ResponseEntity<List> responseEntity = restTemplate.getForEntity(url, List.class);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        List<Map<String, Object>> response = responseEntity.getBody();
        assertNotNull(response);
        assertTrue(response.size() >= 5);
        assertEquals(cassetteRepo.findById(1L).get().getName(), response.get(0).get("name"));
        assertNotEquals(response.get(0).get("name"), response.get(1).get("name"));
    }

    @Test
    void testGetCassette() {
        String url = "http://localhost:" + port + "/api/cassettes/" + 1;
        @SuppressWarnings("unchecked")
        ResponseEntity<Map> responseEntity = restTemplate.getForEntity(url, Map.class);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        Map<String, Object> response = responseEntity.getBody();
        assertNotNull(response);
        assertEquals(cassetteRepo.findById(1L).get().getName(), (String) response.get("name"));
    }

    @Test
    void testGetCranksets() {
        String url = "http://localhost:" + port + "/api/cranksets";
        @SuppressWarnings("unchecked")
        ResponseEntity<List> responseEntity = restTemplate.getForEntity(url, List.class);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        List<Map<String, Object>> response = responseEntity.getBody();
        assertNotNull(response);
        assertTrue(response.size() >= 5);
        assertEquals(cranksetRepo.findById(1L).get().getName(), response.get(0).get("name"));
        assertNotEquals(response.get(0).get("name"), response.get(1).get("name"));
    }

    @Test
    void testGetCrankset() {
        String url = "http://localhost:" + port + "/api/cranksets/" + 1;
        @SuppressWarnings("unchecked")
        ResponseEntity<Map> responseEntity = restTemplate.getForEntity(url, Map.class);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        Map<String, Object> response = responseEntity.getBody();
        assertNotNull(response);
        assertEquals(cranksetRepo.findById(1L).get().getName(), (String) response.get("name"));
    }

    @Test
    void testGetTyres() {
        String url = "http://localhost:" + port + "/api/tyres";
        @SuppressWarnings("unchecked")
        ResponseEntity<List> responseEntity = restTemplate.getForEntity(url, List.class);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        List<Map<String, Object>> response = responseEntity.getBody();
        assertNotNull(response);
        assertTrue(response.size() >= 5);
        assertEquals(tyreRepo.findById(1L).get().getName(), response.get(0).get("name"));
        assertNotEquals(response.get(0).get("name"), response.get(1).get("name"));
    }

    @Test
    void testGetTyre() {
        String url = "http://localhost:" + port + "/api/tyres/" + 1;
        @SuppressWarnings("unchecked")
        ResponseEntity<Map> responseEntity = restTemplate.getForEntity(url, Map.class);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        Map<String, Object> response = responseEntity.getBody();
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
        ResponseEntity<Map> responseEntity = restTemplate.getForEntity(url, Map.class);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        Map<String, Object> response = responseEntity.getBody();
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
        ResponseEntity<Map> responseEntity = restTemplate.getForEntity(url, Map.class);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        Map<String, Object> response = responseEntity.getBody();
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
        ResponseEntity<Map> responseEntity = restTemplate.getForEntity(url, Map.class);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        Map<String, Object> response = responseEntity.getBody();
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
        ResponseEntity<Map> responseEntity = restTemplate.getForEntity(url, Map.class);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        Map<String, Object> response = responseEntity.getBody();

        assertNotNull(response);
        assertEquals(crankset.getRings(), response.get("chainrings"));
        assertEquals(cassette.getSprockets(), response.get("sprockets"));

        Calculation calc = new Calculation(cassette, crankset);
        List<List<Double>> result = calc.getRatio();
        assertEquals(result, response.get("results"));
    }

    @Test
    void testGetInvalidManualRequests() {
        String base_url = "http://localhost:" + port + "/api/calculate/";
        String[] url_parts = {"ratio", "rollout", "speed"};
        String[][] params = {
            {"1a,12", "11,12", "Invalid Manual Crankset"},
            {"11,12", "1a,12", "Invalid Manual Cassette"},
            {"", "11,12", "Invalid Manual Crankset"},
            {"11,12", "", "Invalid Manual Cassette"},
        };

        for (String url_part : url_parts) {
            for (String[] param : params) {
                UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(base_url + url_part)
                    .queryParam("manual_chainring", param[0])
                    .queryParam("manual_cassette", param[1])
                    .queryParam("tyre_id", "1");
                String url = builder.toUriString();

                ResponseEntity<Map> responseEntity = restTemplate.getForEntity(url, Map.class);
                assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
                @SuppressWarnings("unchecked")
                Map<String, Object> response = responseEntity.getBody();
                assertEquals(param[2], response.get("error"));
            }
        }
    }

    @Test
    void testGetCalculateInvalidIds() {
        String base_url = "http://localhost:" + port + "/api/calculate/";
        String[] url_parts = {"ratio", "rollout", "speed"};
        String[][] params = {
            {"crankset_id=1&cassette_id=999&tyre_id=1", "Cassette not found"},
            {"crankset_id=999&cassette_id=1&tyre_id=1", "Crankset not found"},
            {"crankset_id=1&cassette_id=1&tyre_id=999", "Tyre not found"},
            {"crankset_id=1&cassette_id=aaa&tyre_id=1", "Invalid Cassette ID"},
            {"crankset_id=aaa&cassette_id=1&tyre_id=1", "Invalid Crankset ID"},
            {"crankset_id=1&cassette_id=1&tyre_id=aaa", "Invalid Tyre ID"}
        };

        for (String url_part : url_parts) {
            for (String[] param : params) {
                if (!"ratio".equals(url_part) && 
                (!"crankset_id=1&cassette_id=1&tyre_id=999".equals(param[0]) || !"crankset_id=1&cassette_id=1&tyre_id=aaa".equals(param[0]))) {

                    String url = base_url + url_part + "?" + param[0];
                    ResponseEntity<Map> responseEntity = restTemplate.getForEntity(url, Map.class);

                    if (param[1].contains("found")) {
                        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
                    } else {
                        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
                    }
                    @SuppressWarnings("unchecked")
                    Map<String, Object> response = responseEntity.getBody();
                    assertEquals(param[1], response.get("error"));
                }
            }
        }
    }

    @Test
    void testGetInvalidRequests() {
        String base_url = "http://localhost:" + port + "/api/calculate/";
        String[] url_parts = {"ratio", "rollout", "speed"};
        String[][] params = {
            {"", "Invalid Manual Cassette"},
            {"cassette_id=1&tyre_id=1", "Invalid Manual Crankset"},
            {"crankset_id=1&tyre_id=1", "Invalid Manual Cassette"},
            {"crankset_id=1&cassette_id=1", "Tyre ID not provided"}
        };

        for (String url_part : url_parts) {
            for (String[] param : params) {
                if (!"ratio".equals(url_part) && !"cassette_id=1&cassette_id=1".equals(param[0])) {
                    String url = base_url + url_part + "?" + param[0];

                    ResponseEntity<Map> responseEntity = restTemplate.getForEntity(url, Map.class);

                    assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
                    @SuppressWarnings("unchecked")
                    Map<String, Object> response = responseEntity.getBody();
                    assertEquals(param[1], response.get("error"));
                }
            }
        }
    }

    @Test
    void testGetInvalidCadences() {
        String base_url = "http://localhost:" + port + "/api/calculate/speed?tyre_id=1&crankset_id=1&cassette_id=1";
        String[][] params = {
            {"6a","120","10", "Invalid minimum cadence"},
            {"60","12a","10", "Invalid maximum cadence"}, 
            {"60","120","1a", "Invalid cadence increment"},
            {"120","60","10", "min_cadence cannot be greater than max_cadence"},
            {"60","120","0", "cadence_increment must be greater than 0"},
        };

        for (String[] paramSet : params) {
            UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(base_url)
                    .queryParam("min_cadence", paramSet[0])
                    .queryParam("max_cadence", paramSet[1])
                    .queryParam("cadence_increment", paramSet[2]);
            String url = builder.toUriString();

            ResponseEntity<Map> responseEntity = restTemplate.getForEntity(url, Map.class);

            assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
            @SuppressWarnings("unchecked")
            Map<String, Object> response = responseEntity.getBody();
            assertEquals(paramSet[3], response.get("error"));
        }
    }

    @Test
    void testGetCadenceDefault() {
        String base_url = "http://localhost:" + port + "/api/calculate/speed?tyre_id=1&crankset_id=1&cassette_id=1";
        String[][] params = {
            {"","120","10"},
            {"60","","10"}, 
            {"60","120",""},
            {"", "", ""}
        };

        List<Integer> expectedCadenceList = new ArrayList<>();
        for (int i = 60; i <= 120; i += 10) {
            expectedCadenceList.add(i);
        }

        for (String[] paramSet : params) {
            UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(base_url)
                    .queryParam("min_cadence", paramSet[0])
                    .queryParam("max_cadence", paramSet[1])
                    .queryParam("cadence_increment", paramSet[2]);
            String url = builder.toUriString();

            ResponseEntity<Map> responseEntity = restTemplate.getForEntity(url, Map.class);
            assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
            Map<String, Object> response = responseEntity.getBody();
            assertEquals(expectedCadenceList, response.get("cadences"));
        }
    }
}
