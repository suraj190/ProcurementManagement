package com.plant.procurement.store.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StoreIssueLineRequest(
        @NotNull
        Long requisitionLineId,

        @NotNull
        @Min(0)
        Double issuedQuantity
) {
}

