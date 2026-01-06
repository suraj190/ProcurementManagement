package com.plant.procurement.store.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StoreReturnLineRequest(
        @NotNull
        Long itemId,

        @NotNull
        @Min(0)
        Double returnedQuantity,

        String reason
) {
}

