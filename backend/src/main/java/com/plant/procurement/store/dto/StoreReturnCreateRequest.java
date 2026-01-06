package com.plant.procurement.store.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record StoreReturnCreateRequest(
        Long storeIssueId, // Optional - return can be standalone

        @NotNull
        Long departmentId,

        @NotBlank
        String returnedBy,

        LocalDate returnDate,

        String remarks,

        @NotNull
        @Valid
        List<StoreReturnLineRequest> lines
) {
}

