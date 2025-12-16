package com.bike_calculator.bike_calculator;

import java.util.List;

public class ResultResponse {
    private List<List<Double>> result;
    private List<Integer> chainrings;
    private List<Integer> sprockets;

    public ResultResponse(List<List<Double>> result, List<Integer> chainrings, List<Integer> sprockets) {
        this.result = result;
        this.chainrings = chainrings;
        this.sprockets = sprockets;
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
}
