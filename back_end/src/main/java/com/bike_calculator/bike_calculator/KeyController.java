/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.bike_calculator.bike_calculator;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author angus
 */
@CrossOrigin(origins = "*")
@RestController
public class KeyController {

    @Value("${google.maps.key:}")
    private String googleMapsKey;

    @GetMapping("/api/get-google-maps-key")
    public Map<String, String> getGoogleMapsKey() {
        Map<String, String> response = new HashMap<>();
        response.put("google_maps_key", googleMapsKey);
        return response;
    }
}