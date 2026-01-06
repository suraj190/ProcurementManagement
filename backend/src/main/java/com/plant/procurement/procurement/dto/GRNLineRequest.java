package com.plant.procurement.procurement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record GRNLineRequest(
        @NotNull
        Long purchaseOrderLineId,

        @NotNull
        Long itemId,

        @NotNull
        @Min(0)
        Double receivedQuantity
) {
}

