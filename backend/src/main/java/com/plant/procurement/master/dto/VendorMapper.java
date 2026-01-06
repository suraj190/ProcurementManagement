package com.plant.procurement.master.dto;

import com.plant.procurement.master.Vendor;
import org.springframework.stereotype.Component;

@Component
public class VendorMapper {

    public VendorResponse toResponse(Vendor vendor) {
        if (vendor == null) {
            return null;
        }

        return new VendorResponse(
                vendor.getId(),
                vendor.getCode(),
                vendor.getName(),
                vendor.getGstNumber(),
                vendor.getContactEmail(),
                vendor.getContactPhone(),
                vendor.isActive()
        );
    }
}

