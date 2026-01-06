package com.plant.procurement.procurement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record PurchaseRequisitionLineRequest(
        @NotNull
        Long itemId,

        @NotNull
        @Min(0)
        Double quantity,

        String purpose
) {
}

