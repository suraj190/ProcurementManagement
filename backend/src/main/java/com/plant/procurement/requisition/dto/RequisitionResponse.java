package com.plant.procurement.requisition.dto;

import com.plant.procurement.master.dto.DepartmentResponse;
import com.plant.procurement.requisition.RequisitionStatus;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record RequisitionResponse(
        Long id,
        String reqNumber,
        DepartmentResponse department,
        String requestedBy,
        LocalDate requiredByDate,
        String remarks,
        RequisitionStatus status,
        List<RequisitionLineResponse> lines,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        OffsetDateTime hodActionAt,
        OffsetDateTime plantHeadActionAt
) {
}

