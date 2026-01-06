package com.plant.procurement.store;

import com.plant.procurement.master.Item;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "store_stocks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false, unique = true)
    private Item item;

    /**
     * Current available quantity in the Common Store.
     */
    @Column(nullable = false)
    private Double availableQuantity = 0.0;

    /**
     * Reserved quantity (for pending issues).
     */
    @Column(nullable = false)
    private Double reservedQuantity = 0.0;
}

