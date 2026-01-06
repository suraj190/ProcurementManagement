package com.plant.procurement.requisition.dto;

import com.plant.procurement.master.dto.DepartmentResponse;
import com.plant.procurement.requisition.RequisitionStatus;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record RequisitionListItemResponse(
        Long id,
        String reqNumber,
        DepartmentResponse department,
        String requestedBy,
        LocalDate requiredByDate,
        RequisitionStatus status,
        Integer lineCount,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}

