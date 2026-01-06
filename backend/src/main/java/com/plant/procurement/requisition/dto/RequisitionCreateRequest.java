package com.plant.procurement.requisition.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record RequisitionCreateRequest(

        @NotNull
        Long departmentId,

        @NotBlank
        String requestedBy,

        LocalDate requiredByDate,

        String remarks,

        @NotNull
        @Valid
        List<RequisitionLineRequest> lines
) {
}


