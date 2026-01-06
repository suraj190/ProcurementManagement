package com.plant.procurement.requisition.dto;

import jakarta.validation.constraints.NotBlank;

public record RequisitionDecisionRequest(

        @NotBlank
        String decidedBy,

        String remarks
) {
}


