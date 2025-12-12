package com.bike_calculator.bike_calculator;

import java.util.ArrayList;
import java.util.List;

public class Calculation {

    Cassette cassette;
    Crankset crankset;
    Tyre tyre;
    List<Integer> cadenceList;

    public Calculation(Cassette cassette, Crankset crankset) {
        this.cassette = cassette;
        this.crankset = crankset;
    }

    public Calculation(Cassette cassette, Crankset crankset, Tyre tyre) {
        this.cassette = cassette;
        this.crankset = crankset;
        this.tyre = tyre; 
    }

    public Calculation(Cassette cassette, Crankset crankset, Tyre tyre, List<Integer> cadenceList) {
        this.cassette = cassette;
        this.crankset = crankset;
        this.tyre = tyre;
        this.cadenceList = cadenceList;
    }

    public List<List<Double>> getRatio() {
        List<List<Double>> result = new ArrayList<>();

        for (Integer chainring : crankset.getRings()) {
            List<Double> tempResult = new ArrayList<>();
            for (Integer sprocket : cassette.getSprockets()) {
                tempResult.add((double) chainring / (double) sprocket);
            }
            result.add(tempResult);
        }

        return result;
    }

    public List<List<Double>> getRollout() {
        int tyreCircumference = tyre.getCircumference();
        List<List<Double>> result = new ArrayList<>();

        for (Integer chainring : crankset.getRings()) {
            List<Double> tempResult = new ArrayList<>();
            for (Integer sprocket : cassette.getSprockets()) {
                tempResult.add((double) chainring / (double) sprocket * tyreCircumference);
            }
            result.add(tempResult);
        }

        return result;
    }

    public List<List<Double>> getSpeed() {
        int tyreCircumference = tyre.getCircumference();
        List<Double> ratios = new ArrayList<>();

        for (Integer chainring : crankset.getRings()) {
            for (Integer sprocket : cassette.getSprockets()) {
                ratios.add((double) chainring / (double) sprocket);
            }
        }

        List<List<Double>> result = new ArrayList<>();
        for (Double ratio : ratios) {
            List<Double> tempResult = new ArrayList<>();
            for (int cadence : cadenceList) {
                tempResult.add(ratio * cadence * tyreCircumference / 16670);
            }
            result.add(tempResult);
        }

        return result;
    }
}
