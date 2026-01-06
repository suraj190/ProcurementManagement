package com.plant.procurement.master.dto;

public record ItemResponse(
        Long id,
        String code,
        String description,
        String uom,
        Integer minStock,
        Integer reorderLevel,
        Boolean active
) {
}

