package com.plant.procurement.store;

import com.plant.procurement.master.Item;
import com.plant.procurement.requisition.RequisitionLine;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "store_issue_lines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreIssueLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_issue_id", nullable = false)
    private StoreIssue storeIssue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisition_line_id")
    private RequisitionLine requisitionLine;

    /**
     * Quantity requested in the requisition.
     */
    @Column(nullable = false)
    private Double requestedQuantity;

    /**
     * Quantity actually issued.
     */
    @Column(nullable = false)
    private Double issuedQuantity;
}

