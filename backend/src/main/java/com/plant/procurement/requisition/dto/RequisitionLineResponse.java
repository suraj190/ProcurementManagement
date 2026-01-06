package com.plant.procurement.requisition.dto;

import com.plant.procurement.master.dto.ItemResponse;

public record RequisitionLineResponse(
        Long id,
        ItemResponse item,
        Double quantity,
        String purpose
) {
}

