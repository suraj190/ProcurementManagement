package com.plant.procurement.procurement;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    @EntityGraph(attributePaths = {"purchaseRequisition", "vendor", "department", "lines", "lines.item"})
    Optional<PurchaseOrder> findById(Long id);

    @EntityGraph(attributePaths = {"purchaseRequisition", "vendor", "department", "lines", "lines.item"})
    List<PurchaseOrder> findAll();
}

