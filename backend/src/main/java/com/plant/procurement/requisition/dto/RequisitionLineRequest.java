package com.plant.procurement.requisition.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record RequisitionLineRequest(

        @NotNull
        Long itemId,

        @NotNull
        @Min(0)
        Double quantity,

        String purpose
) {
}


