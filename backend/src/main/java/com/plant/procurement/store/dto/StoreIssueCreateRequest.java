package com.plant.procurement.store.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record StoreIssueCreateRequest(
        @NotNull
        Long requisitionId,

        @NotBlank
        String issuedBy,

        LocalDate issueDate,

        String remarks,

        @NotNull
        @Valid
        List<StoreIssueLineRequest> lines
) {
}

