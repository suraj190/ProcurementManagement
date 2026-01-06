package com.plant.procurement.store;

import com.plant.procurement.master.Item;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StoreStockRepository extends JpaRepository<StoreStock, Long> {

    @EntityGraph(attributePaths = {"item"})
    Optional<StoreStock> findByItemId(Long itemId);

    @EntityGraph(attributePaths = {"item"})
    Optional<StoreStock> findByItem(Item item);

    @EntityGraph(attributePaths = {"item"})
    List<StoreStock> findAll();
}

