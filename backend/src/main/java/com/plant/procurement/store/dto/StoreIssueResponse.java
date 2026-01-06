package com.plant.procurement.store.dto;

import com.plant.procurement.master.dto.DepartmentResponse;
import com.plant.procurement.requisition.dto.RequisitionListItemResponse;
import com.plant.procurement.store.StoreIssueStatus;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record StoreIssueResponse(
        Long id,
        String issueNumber,
        RequisitionListItemResponse requisition,
        DepartmentResponse department,
        String issuedBy,
        LocalDate issueDate,
        String remarks,
        StoreIssueStatus status,
        List<StoreIssueLineResponse> lines,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}

