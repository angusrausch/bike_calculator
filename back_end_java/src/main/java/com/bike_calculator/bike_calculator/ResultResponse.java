package com.bike_calculator.bike_calculator;

import java.util.List;

public class ResultResponse {
    private List<List<Double>> result;
    private List<Integer> chainrings;
    private List<Integer> sprockets;
    private List<Integer> cadences;
    private Integer tyreCircumference;

    public ResultResponse(List<List<Double>> result, List<Integer> chainrings, List<Integer> sprockets) {
        this.result = result;
        this.chainrings = chainrings;
        this.sprockets = sprockets;
    }

        public ResultResponse(List<List<Double>> result, List<Integer> chainrings, List<Integer> sprockets, Integer tyreCircumference) {
        this.result = result;
        this.chainrings = chainrings;
        this.sprockets = sprockets;
        this.tyreCircumference = tyreCircumference;
    }

    public ResultResponse(List<List<Double>> result, List<Integer> chainrings, List<Integer> sprockets, Integer tyreCircumference, List<Integer> cadences) {
        this.result = result;
        this.chainrings = chainrings;
        this.sprockets = sprockets;
        this.tyreCircumference = tyreCircumference;
        this.cadences = cadences;
    }

    public List<List<Double>> getResults() {
        return result;
    }

    public List<Integer> getChainrings() {
        return chainrings;
    }

    public List<Integer> getSprockets() {
        return sprockets;
    }
    
        public Integer getTyre_circumference() {
            return tyreCircumference;
        }

    public List<Integer> getCadences() {
        return cadences;
    }
}
