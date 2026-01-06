package com.plant.procurement.store.dto;

import com.plant.procurement.master.dto.ItemResponse;

public record StoreIssueLineResponse(
        Long id,
        ItemResponse item,
        Double requestedQuantity,
        Double issuedQuantity
) {
}

