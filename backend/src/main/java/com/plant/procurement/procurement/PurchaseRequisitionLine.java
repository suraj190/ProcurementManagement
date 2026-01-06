package com.plant.procurement.procurement;

import com.plant.procurement.master.Item;
import com.plant.procurement.requisition.RequisitionLine;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "purchase_requisition_lines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseRequisitionLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_requisition_id", nullable = false)
    private PurchaseRequisition purchaseRequisition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisition_line_id")
    private RequisitionLine requisitionLine; // Link back to original requisition line if applicable

    @Column(nullable = false)
    private Double quantity;

    @Column(length = 300)
    private String purpose;
}

