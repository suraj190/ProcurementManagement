package com.plant.procurement.procurement;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PurchaseRequisitionRepository extends JpaRepository<PurchaseRequisition, Long> {

    @EntityGraph(attributePaths = {"requisition", "department", "lines", "lines.item"})
    Optional<PurchaseRequisition> findById(Long id);

    @EntityGraph(attributePaths = {"requisition", "department", "lines", "lines.item"})
    List<PurchaseRequisition> findAll();
}

