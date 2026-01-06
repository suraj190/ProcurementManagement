package com.plant.procurement.procurement.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PurchaseOrderLineRequest(
        @NotNull
        Long purchaseRequisitionLineId,

        @NotNull
        Long itemId,

        @NotNull
        @Min(0)
        Double quantity,

        @NotNull
        @DecimalMin("0.0")
        BigDecimal unitPrice,

        String remarks
) {
}

