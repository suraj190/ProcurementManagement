package com.plant.procurement.master.dto;

import com.plant.procurement.master.Item;
import org.springframework.stereotype.Component;

@Component
public class ItemMapper {

    public ItemResponse toResponse(Item item) {
        if (item == null) {
            return null;
        }

        return new ItemResponse(
                item.getId(),
                item.getCode(),
                item.getDescription(),
                item.getUom(),
                item.getMinStock(),
                item.getReorderLevel(),
                item.isActive()
        );
    }
}

