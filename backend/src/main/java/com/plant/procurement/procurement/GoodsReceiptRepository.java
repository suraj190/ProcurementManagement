package com.plant.procurement.procurement;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GoodsReceiptRepository extends JpaRepository<GoodsReceipt, Long> {

    @EntityGraph(attributePaths = {"purchaseOrder", "vendor", "department", "lines", "lines.item", "lines.purchaseOrderLine"})
    Optional<GoodsReceipt> findById(Long id);

    @EntityGraph(attributePaths = {"purchaseOrder", "vendor", "department", "lines", "lines.item"})
    List<GoodsReceipt> findAll();
}

