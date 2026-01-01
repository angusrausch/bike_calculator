package com.bike_calculator.bike_calculator;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@CrossOrigin(origins = "*")
@RestController
public class CalculatorController {

    @Autowired
    private CranksetRepo cranksetRepo;
    @Autowired
    private CassetteRepo cassetteRepo;
    @Autowired
    private TyreRepo tyreRepo;

    @GetMapping("cassettes")
    public List<Cassette> getAllCassettes() {
        return cassetteRepo.findAll();
    }

    @GetMapping("cranksets")
    public List<Crankset> getAllCranksets() {
        return cranksetRepo.findAll();
    }

    @GetMapping("tyres")
    public List<Tyre> getAllTyres() {
        return tyreRepo.findAll();
    }

    @GetMapping("cassettes/{id}")
    public ResponseEntity<Cassette> getCassette(@PathVariable long id) {
        return cassetteRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("cranksets/{id}")
    public ResponseEntity<Crankset> getCrankset(@PathVariable long id) {
        return cranksetRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("tyres/{id}")
    public ResponseEntity<Tyre> getTyre(@PathVariable long id) {
        return tyreRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private <T> T findRequiredEntity(JpaRepository<T, Long> repo, Long id, String entityName) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, 
                        entityName + " with ID " + id + " not found."
                ));
    }

    @GetMapping("calculate/ratio")
    public ResponseEntity<ResultResponse> calculateRatio(
            @RequestParam(defaultValue = "0") Long cassette_id,
            @RequestParam(defaultValue = "0") Long crankset_id,
            @RequestParam(defaultValue = "") String manual_cassette,
            @RequestParam(defaultValue = "") String manual_chainring) {

        Cassette cassette;
        if (cassette_id != 0) {
            cassette = findRequiredEntity(cassetteRepo, cassette_id, "Cassette");
        } else {
            List<Integer> cassetteSprockets = java.util.Arrays.stream(manual_cassette.split(","))
                                      .map(String::trim)
                                      .map(Integer::parseInt)
                                      .collect(Collectors.toList());
            cassette = new Cassette("Manual", cassetteSprockets);
        }

        Crankset crankset;
        if (crankset_id != 0) {
            crankset = findRequiredEntity(cranksetRepo, crankset_id, "Crankset");
        } else {
            List<Integer> cranksetRings = java.util.Arrays.stream(manual_chainring.split(","))
                    .map(String::trim)
                    .map(Integer::parseInt)
                    .collect(Collectors.toList());
            crankset = new Crankset("Manual", cranksetRings);
        }

        Calculation calculation = new Calculation(cassette, crankset);
        List<List<Double>> result = calculation.getRatio();

        ResultResponse response = new ResultResponse(result, crankset.getRings(), cassette.getSprockets());

        return ResponseEntity.ok(response);
    }

    @GetMapping("calculate/rollout")
    public ResponseEntity<ResultResponse> calculateRollout(
            @RequestParam(defaultValue = "0") Long cassette_id,
            @RequestParam(defaultValue = "0") Long crankset_id,
            @RequestParam Long tyre_id,
            @RequestParam(defaultValue = "") String manual_cassette,
            @RequestParam(defaultValue = "") String manual_chainring) {

        Cassette cassette;
        if (cassette_id != 0) {
            cassette = findRequiredEntity(cassetteRepo, cassette_id, "Cassette");
        } else {
            List<Integer> cassetteSprockets = java.util.Arrays.stream(manual_cassette.split(","))
                    .map(String::trim)
                    .map(Integer::parseInt)
                    .collect(Collectors.toList());
            cassette = new Cassette("Manual", cassetteSprockets);
        }

        Crankset crankset;
        if (crankset_id != 0) {
            crankset = findRequiredEntity(cranksetRepo, crankset_id, "Crankset");
        } else {
            List<Integer> cranksetRings = java.util.Arrays.stream(manual_chainring.split(","))
                    .map(String::trim)
                    .map(Integer::parseInt)
                    .collect(Collectors.toList());
            crankset = new Crankset("Manual", cranksetRings);
        }

        Tyre tyre = findRequiredEntity(tyreRepo, tyre_id, "Tyre");

        Calculation calculation = new Calculation(cassette, crankset, tyre);
        List<List<Double>> result = calculation.getRollout();

        ResultResponse response = new ResultResponse(result, crankset.getRings(), cassette.getSprockets());

        return ResponseEntity.ok(response);
    }

    @GetMapping("calculate/speed")
    public ResponseEntity<ResultResponse> calculateSpeed(
            @RequestParam(defaultValue = "0") Long cassette_id,
            @RequestParam(defaultValue = "0") Long crankset_id,
            @RequestParam Long tyre_id,
            @RequestParam(defaultValue = "60") int min_cadence,
            @RequestParam(defaultValue = "120") int max_cadence,
            @RequestParam(defaultValue = "10") int cadence_increment,
            @RequestParam(defaultValue = "") String manual_cassette,
            @RequestParam(defaultValue = "") String manual_chainring) {

        Cassette cassette;
        if (cassette_id != 0) {
            cassette = findRequiredEntity(cassetteRepo, cassette_id, "Cassette");
        } else {
            List<Integer> cassetteSprockets = java.util.Arrays.stream(manual_cassette.split(","))
                    .map(String::trim)
                    .map(Integer::parseInt)
                    .collect(Collectors.toList());
            cassette = new Cassette("Manual", cassetteSprockets);
        }

        Crankset crankset;
        if (crankset_id != 0) {
            crankset = findRequiredEntity(cranksetRepo, crankset_id, "Crankset");
        } else {
            List<Integer> cranksetRings = java.util.Arrays.stream(manual_chainring.split(","))
                    .map(String::trim)
                    .map(Integer::parseInt)
                    .collect(Collectors.toList());
            crankset = new Crankset("Manual", cranksetRings);
        }

        Tyre tyre = findRequiredEntity(tyreRepo, tyre_id, "Tyre");

        List<Integer> cadenceList = new ArrayList<>();
        for (int i = min_cadence; i <= max_cadence; i += cadence_increment) {
            cadenceList.add(i);
        }

        Calculation calculation = new Calculation(cassette, crankset, tyre, cadenceList);
        List<List<Double>> result = calculation.getSpeed();

        ResultResponse response = new ResultResponse(result, crankset.getRings(), cassette.getSprockets(), cadenceList);

        return ResponseEntity.ok(response);
    }
}
