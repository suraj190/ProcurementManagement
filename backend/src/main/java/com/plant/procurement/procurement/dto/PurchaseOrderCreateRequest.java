package com.plant.procurement.procurement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record PurchaseOrderCreateRequest(
        @NotNull
        Long purchaseRequisitionId,

        @NotNull
        Long vendorId,

        Long departmentId,

        @NotBlank
        String createdBy,

        LocalDate orderDate,

        LocalDate expectedDeliveryDate,

        String remarks,

        @NotNull
        @Valid
        List<PurchaseOrderLineRequest> lines
) {
}

