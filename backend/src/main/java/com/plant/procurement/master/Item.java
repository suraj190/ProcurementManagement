package com.plant.procurement.master;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * SKU / item code – expected to be unique across plant.
     */
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 250)
    private String description;

    @Column(nullable = false, length = 30)
    private String uom; // e.g. KG, LTR, NOS

    /**
     * Minimum stock to be maintained (for control).
     */
    private Integer minStock;

    /**
     * Reorder level – when on-hand falls below this, show alerts.
     */
    private Integer reorderLevel;

    @Column(nullable = false)
    private boolean active = true;
}


