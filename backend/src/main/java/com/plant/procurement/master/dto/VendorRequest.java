package com.plant.procurement.master.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VendorRequest(

        @NotBlank
        @Size(max = 50)
        String code,

        @NotBlank
        @Size(max = 200)
        String name,

        @Size(max = 20)
        String gstNumber,

        @Email
        @Size(max = 150)
        String contactEmail,

        @Size(max = 20)
        String contactPhone,

        Boolean active
) {
}


