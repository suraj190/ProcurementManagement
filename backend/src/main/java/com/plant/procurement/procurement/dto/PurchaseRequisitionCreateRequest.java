package com.plant.procurement.procurement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record PurchaseRequisitionCreateRequest(
        Long requisitionId, // Optional - PR can be standalone or from requisition

        Long departmentId,

        @NotBlank
        String requestedBy,

        LocalDate requiredByDate,

        String remarks,

        @NotNull
        @Valid
        List<PurchaseRequisitionLineRequest> lines
) {
}

