package com.plant.procurement.store;

import com.plant.procurement.master.Item;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "store_return_lines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreReturnLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_return_id", nullable = false)
    private StoreReturn storeReturn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_issue_line_id")
    private StoreIssueLine storeIssueLine; // Link back to original issue if applicable

    @Column(nullable = false)
    private Double returnedQuantity;

    @Column(length = 300)
    private String reason;
}

