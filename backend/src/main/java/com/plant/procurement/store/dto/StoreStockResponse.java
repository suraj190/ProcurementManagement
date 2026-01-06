package com.plant.procurement.store.dto;

import com.plant.procurement.master.dto.ItemResponse;

public record StoreStockResponse(
        Long id,
        ItemResponse item,
        Double availableQuantity,
        Double reservedQuantity,
        Double totalQuantity
) {
}

