/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.bike_calculator.bike_calculator;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import tools.jackson.databind.ObjectMapper;

/**
 *
 * @author angus
 */
@CrossOrigin(origins = "*")
@RestController
public class KeyController {

    // GOOGLE MAPS
    @Value("${google.maps.key:}")
    private String googleMapsKey;

    @GetMapping("/api/get-google-maps-key")
    public Map<String, String> getGoogleMapsKey() {
        Map<String, String> response = new HashMap<>();
        response.put("google_maps_key", googleMapsKey);
        return response;
    }

    // STRAVA
    @Value("${strava.client.id:}")
    private String stravaClientId;
    @Value("${strava.client.secret:}")
    private String stravaClientSecret;

    @GetMapping("/api/get-strava-client-id")
    public Map<String, String> getStravaClientId() {
        Map<String, String> response = new HashMap<>();
        response.put("strava_client_id", stravaClientId);
        return response;
    }

    @PostMapping("/api/strava-login")
    public ResponseEntity<?> stravaLogin(@RequestParam String code, @RequestParam String state) throws IOException, InterruptedException {
        String redirectUri = "http://localhost:3000/strava";
        String tokenUri = "https://www.strava.com/oauth/token";

        String bodyData = "client_id=" + URLEncoder.encode(stravaClientId, "UTF-8") +
                          "&client_secret=" + URLEncoder.encode(stravaClientSecret, "UTF-8") +
                          "&code=" + URLEncoder.encode(code, "UTF-8") +
                          "&grant_type=" + URLEncoder.encode("authorization_code", "UTF-8") +
                          "&redirect_uri=" + URLEncoder.encode(redirectUri, "UTF-8");

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(tokenUri))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(bodyData))
                .build();

        HttpResponse<String> httpResponse = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (httpResponse.statusCode() != 200) {
            return ResponseEntity.badRequest().body("Strava API error: " + httpResponse.body());
        }

        ObjectMapper mapper = new ObjectMapper();
        StravaTokenResponse response = mapper.readValue(httpResponse.body(), StravaTokenResponse.class);

        return ResponseEntity.ok(response);
    }

    public static class StravaTokenResponse {
        public String token_type;
        public long expires_at;
        public int expires_in;
        public String refresh_token;
        public String access_token;
    }
}

