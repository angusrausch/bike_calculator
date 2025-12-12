// === src/main/java/com/bike_calculator/bike_calculator/Tyre.java ===
package com.bike_calculator.bike_calculator;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="Tyres")
public class Tyre {
    
    @Id 
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private long id;
    private String name;
    private int circumference;

    public Tyre() {
    }

    public Tyre(String name, int circumference) {
        this.name = name;
        this.circumference = circumference;
    }

    public long getId() {return id; }
    public String getName() {return name;}
    public int getCircumference() {return circumference;}
}