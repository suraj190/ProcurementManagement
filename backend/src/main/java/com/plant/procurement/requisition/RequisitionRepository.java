package com.plant.procurement.requisition;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RequisitionRepository extends JpaRepository<Requisition, Long> {

    @EntityGraph(attributePaths = {"department", "lines", "lines.item"})
    Optional<Requisition> findById(Long id);

    @EntityGraph(attributePaths = {"department", "lines", "lines.item"})
    List<Requisition> findAll();
}


