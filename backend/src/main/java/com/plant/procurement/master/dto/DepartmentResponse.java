package com.plant.procurement.master.dto;

public record DepartmentResponse(
        Long id,
        String code,
        String name,
        Boolean active
) {
}

