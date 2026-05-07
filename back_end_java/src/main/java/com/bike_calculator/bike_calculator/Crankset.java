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
@Table(name="Cranksets")
public class Crankset {
    
    @Id 
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private long id;
    private String name;

    @Column(name = "rings")
    @Convert(converter = IntListConverter.class)
    private List<Integer> rings;

    public Crankset() {

    }

    public Crankset(String name, List<Integer> rings) {
        this.name = name;
        Collections.sort(rings);
        this.rings = rings.stream().distinct().collect(Collectors.toList());

    }

    public long getId() {return id; }
    public String getName() { return name; }
    public List<Integer> getRings() { return rings; }
    public int getSpeed() { return rings != null ? rings.size() : 0; }
}