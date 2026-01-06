package com.plant.procurement.procurement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record GRNCreateRequest(
        @NotNull
        Long purchaseOrderId,

        @NotBlank
        String receivedBy,

        LocalDate receiptDate,

        String remarks,

        @NotNull
        @Valid
        List<GRNLineRequest> lines
) {
}

