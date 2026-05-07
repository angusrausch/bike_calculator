package com.bike_calculator.bike_calculator;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="Cassettes")
public class Cassette {
    
    @Id 
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private long id;
    private String name;

    @Column(name = "sprockets")         // Maps the field to a single column named 'sprockets'
    @Convert(converter = IntListConverter.class) // Uses the converter to handle List<Integer> <-> String
    private List<Integer> sprockets;

    public Cassette() {
    }

    public Cassette(String name, List<Integer> sprockets) {
        this.name = name;
        Collections.sort(sprockets);
        this.sprockets = sprockets.stream().distinct().collect(Collectors.toList());
    }

    public long getId() {return id; }
    public String getName() { return name; }
    public List<Integer> getSprockets() { return sprockets; }
    public int getSpeed() { return sprockets != null ? sprockets.size() : 0; }
}