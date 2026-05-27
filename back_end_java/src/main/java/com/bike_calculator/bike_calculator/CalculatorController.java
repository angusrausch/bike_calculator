package com.bike_calculator.bike_calculator;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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

    @GetMapping("/api/cassettes")
    public List<Cassette> getAllCassettes() {
        return cassetteRepo.findAll();
    }

    @GetMapping("/api/cranksets")
    public List<Crankset> getAllCranksets() {
        return cranksetRepo.findAll();
    }

    @GetMapping("/api/tyres")
    public List<Tyre> getAllTyres() {
        return tyreRepo.findAll();
    }

    @GetMapping("/api/cassettes/{id}")
    public ResponseEntity<Cassette> getCassette(@PathVariable long id) {
        return cassetteRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/api/cranksets/{id}")
    public ResponseEntity<Crankset> getCrankset(@PathVariable long id) {
        return cranksetRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/api/tyres/{id}")
    public ResponseEntity<Tyre> getTyre(@PathVariable long id) {
        return tyreRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private <T> T findRequiredEntity(JpaRepository<T, Long> repo, Long id, String entityName) {
        return repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                entityName + " not found"
            ));
    }

    private Cassette identifyCassette(Long id, String manualCassette) {
        if (id != 0) {
            return findRequiredEntity(cassetteRepo, id, "Cassette");
        } else {
            try {
                List<Integer> cassetteSprockets = java.util.Arrays.stream(manualCassette.split(","))
                        .map(String::trim)
                        .map(Integer::parseInt)
                        .collect(Collectors.toList());
                return new Cassette("Manual", cassetteSprockets);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid Manual Cassette");
            }
        }
    }

    private Crankset identifyCrankset(Long id, String manualCrankset) {
        if (id != 0) {
            return findRequiredEntity(cranksetRepo, id, "Crankset");
        } else {
            try {
                List<Integer> cranksetRings = java.util.Arrays.stream(manualCrankset.split(","))
                        .map(String::trim)
                        .map(Integer::parseInt)
                        .collect(Collectors.toList());
                return new Crankset("Manual", cranksetRings);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid Manual Crankset");
            }
        }
    }

    @GetMapping("/api/calculate/ratio")
    public ResponseEntity<Object> calculateRatio(
            @RequestParam(defaultValue = "0") Long cassette_id,
            @RequestParam(defaultValue = "0") Long crankset_id,
            @RequestParam(defaultValue = "") String manual_cassette,
            @RequestParam(defaultValue = "") String manual_chainring) {

        try {
            Cassette cassette = identifyCassette(cassette_id, manual_cassette);
            Crankset crankset = identifyCrankset(crankset_id, manual_chainring);

            Calculation calculation = new Calculation(cassette, crankset);
            List<List<Double>> result = calculation.getRatio();

            ResultResponse response = new ResultResponse(result, crankset.getRings(), cassette.getSprockets());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getReason()));
        }
    }

    @GetMapping("/api/calculate/rollout")
    public ResponseEntity<Object> calculateRollout(
            @RequestParam(defaultValue = "0") Long cassette_id,
            @RequestParam(defaultValue = "0") Long crankset_id,
            @RequestParam Long tyre_id,
            @RequestParam(defaultValue = "") String manual_cassette,
            @RequestParam(defaultValue = "") String manual_chainring) {

        try {
            Cassette cassette = identifyCassette(cassette_id, manual_cassette);
            Crankset crankset = identifyCrankset(crankset_id, manual_chainring);

            if (tyre_id == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Tyre ID not provided"));
            }

            Tyre tyre = findRequiredEntity(tyreRepo, tyre_id, "Tyre");

            Calculation calculation = new Calculation(cassette, crankset, tyre);
            List<List<Double>> result = calculation.getRollout();

            ResultResponse response = new ResultResponse(result, crankset.getRings(), cassette.getSprockets(), tyre.getCircumference());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getReason()));
        }
    }

    @GetMapping("/api/calculate/speed")
    public ResponseEntity<Object> calculateSpeed(
            @RequestParam(defaultValue = "0") Long cassette_id,
            @RequestParam(defaultValue = "0") Long crankset_id,
            @RequestParam Long tyre_id,
            @RequestParam(defaultValue = "60") int min_cadence,
            @RequestParam(defaultValue = "120") int max_cadence,
            @RequestParam(defaultValue = "10") int cadence_increment,
            @RequestParam(defaultValue = "") String manual_cassette,
            @RequestParam(defaultValue = "") String manual_chainring) {

        try {
            Cassette cassette = identifyCassette(cassette_id, manual_cassette);
            Crankset crankset = identifyCrankset(crankset_id, manual_chainring);

            if (tyre_id == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Tyre ID not provided"));
            }

            Tyre tyre = findRequiredEntity(tyreRepo, tyre_id, "Tyre");

            // cadence validation with the same messages as Python
            try {
                // min_cadence, max_cadence and cadence_increment are already ints; but need to validate values
            } catch (NumberFormatException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid cadence value"));
            }

            if (min_cadence > max_cadence) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "min_cadence cannot be greater than max_cadence"));
            }
            if (!(cadence_increment > 0)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "cadence_increment must be greater than 0"));
            }

            List<Integer> cadenceList = new ArrayList<>();
            for (int i = min_cadence; i <= max_cadence; i += cadence_increment) {
                cadenceList.add(i);
            }
            if (cadenceList.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "No cadence values produced with given parameters"));
            }

            Calculation calculation = new Calculation(cassette, crankset, tyre, cadenceList);
            List<List<Double>> result = calculation.getSpeed();

            ResultResponse response = new ResultResponse(result, crankset.getRings(), cassette.getSprockets(), tyre.getCircumference(), cadenceList);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            String msg = e.getMessage();
            if (msg != null && msg.startsWith("Invalid Manual")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", msg));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", msg != null ? msg : "Invalid request"));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getReason()));
        }
    }
}
