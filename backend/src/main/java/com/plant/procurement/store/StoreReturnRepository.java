package com.plant.procurement.store;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StoreReturnRepository extends JpaRepository<StoreReturn, Long> {

    @EntityGraph(attributePaths = {"storeIssue", "department", "lines", "lines.item"})
    Optional<StoreReturn> findById(Long id);

    @EntityGraph(attributePaths = {"storeIssue", "department", "lines", "lines.item"})
    List<StoreReturn> findAll();
}

