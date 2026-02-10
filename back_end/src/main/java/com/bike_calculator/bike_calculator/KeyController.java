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
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletResponse;

/**
 * Secure Strava Controller
 * Implements HttpOnly cookies for Refresh Tokens
 */

@CrossOrigin(origins = "#{'${frontend.url}'}", allowCredentials = "true")
@RestController
public class KeyController {

    @Value("${google.maps.key:}")
    private String googleMapsKey;

    @Value("${strava.client.id:}")
    private String stravaClientId;
    
    @Value("${strava.client.secret:}")
    private String stravaClientSecret;

    @Value("${frontend.secure}")
    private String secure;

    @GetMapping("/api/get-google-maps-key")
    public Map<String, String> getGoogleMapsKey() {
        Map<String, String> response = new HashMap<>();
        response.put("google_maps_key", googleMapsKey);
        return response;
    }

    @GetMapping("/api/get-strava-client-id")
    public Map<String, String> getStravaClientId() {
        Map<String, String> response = new HashMap<>();
        response.put("strava_client_id", stravaClientId);
        return response;
    }

    @PostMapping("/api/strava-login")
    public ResponseEntity<?> stravaLogin(@RequestParam String code) throws IOException, InterruptedException {
        String redirectUri = "http://localhost:3000/strava"; 
        String tokenUri = "https://www.strava.com/oauth/token";

        String bodyData = "client_id=" + URLEncoder.encode(stravaClientId, StandardCharsets.UTF_8) +
                          "&client_secret=" + URLEncoder.encode(stravaClientSecret, StandardCharsets.UTF_8) +
                          "&code=" + URLEncoder.encode(code, StandardCharsets.UTF_8) +
                          "&grant_type=" + URLEncoder.encode("authorization_code", StandardCharsets.UTF_8) +
                          "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8);

        StravaTokenResponse tokenResponse = callStravaApi(tokenUri, bodyData);

        if (tokenResponse == null) {
            return ResponseEntity.badRequest().body("Failed to exchange token with Strava");
        }

        ResponseCookie refreshCookie = ResponseCookie.from("strava_refresh_token", tokenResponse.refresh_token)
                .httpOnly(true)
                .secure(Boolean.parseBoolean(secure))
                .sameSite("Strict")
                .path("/")
                .maxAge(30L * 24 * 60 * 60)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(tokenResponse);
    }

    @PostMapping("/api/strava-refresh")
    public ResponseEntity<?> stravaRefresh(@CookieValue(name = "strava_refresh_token", required = false) String refreshToken) throws IOException, InterruptedException {
        
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.status(401).body("No active session (missing cookie)");
        }

        String tokenUri = "https://www.strava.com/oauth/token";
        String bodyData = "client_id=" + URLEncoder.encode(stravaClientId, StandardCharsets.UTF_8) +
                          "&client_secret=" + URLEncoder.encode(stravaClientSecret, StandardCharsets.UTF_8) +
                          "&refresh_token=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8) +
                          "&grant_type=" + URLEncoder.encode("refresh_token", StandardCharsets.UTF_8);

        StravaTokenResponse tokenResponse = callStravaApi(tokenUri, bodyData);

        if (tokenResponse == null) {
            return ResponseEntity.status(401).body("Failed to refresh token");
        }

        ResponseCookie newRefreshCookie = ResponseCookie.from("strava_refresh_token", tokenResponse.refresh_token)
                .httpOnly(true)
                .secure(Boolean.parseBoolean(secure))
                .sameSite("Strict")
                .path("/")
                .maxAge(30L * 24 * 60 * 60)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, newRefreshCookie.toString())
                .body(tokenResponse);
    }

    @PostMapping("/api/strava-logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("strava_refresh_token", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        
        return ResponseEntity.ok().body("Logged out");
    }

    private StravaTokenResponse callStravaApi(String uri, String bodyData) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(uri))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(bodyData))
                .build();

        HttpResponse<String> httpResponse = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (httpResponse.statusCode() != 200) {
            System.err.println("Strava API Error: " + httpResponse.body());
            return null;
        }

        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(httpResponse.body(), StravaTokenResponse.class);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StravaTokenResponse {
        public String token_type;
        public long expires_at;
        public int expires_in;
        public String refresh_token;
        public String access_token;
        public Athlete athlete;
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Athlete {
        public Long id;
        public String firstname;
        public String lastname;
    }
}