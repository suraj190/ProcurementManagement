package com.plant.procurement.master.dto;

public record VendorResponse(
        Long id,
        String code,
        String name,
        String gstNumber,
        String contactEmail,
        String contactPhone,
        Boolean active
) {
}

