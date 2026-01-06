package com.plant.procurement.master.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ItemRequest(

        @NotBlank
        @Size(max = 50)
        String code,

        @NotBlank
        @Size(max = 250)
        String description,

        @NotBlank
        @Size(max = 30)
        String uom,

        Integer minStock,

        Integer reorderLevel,

        Boolean active
) {
}


