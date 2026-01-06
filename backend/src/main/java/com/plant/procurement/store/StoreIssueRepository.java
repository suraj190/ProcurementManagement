package com.plant.procurement.store;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StoreIssueRepository extends JpaRepository<StoreIssue, Long> {

    @EntityGraph(attributePaths = {"requisition", "requisition.department", "department", "lines", "lines.item", "lines.requisitionLine"})
    Optional<StoreIssue> findById(Long id);

    @EntityGraph(attributePaths = {"requisition", "requisition.department", "department", "lines", "lines.item"})
    List<StoreIssue> findAll();

    @EntityGraph(attributePaths = {"requisition", "requisition.department", "department", "lines", "lines.item"})
    List<StoreIssue> findByRequisitionId(Long requisitionId);
}

