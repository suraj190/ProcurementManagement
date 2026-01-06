package com.plant.procurement.store;

import com.plant.procurement.master.dto.ItemMapper;
import com.plant.procurement.store.dto.StoreStockResponse;
import org.springframework.stereotype.Component;

@Component
public class StoreStockMapper {

    private final ItemMapper itemMapper;

    public StoreStockMapper(ItemMapper itemMapper) {
        this.itemMapper = itemMapper;
    }

    public StoreStockResponse toResponse(StoreStock stock) {
        if (stock == null) {
            return null;
        }

        double totalQuantity = stock.getAvailableQuantity() + stock.getReservedQuantity();

        return new StoreStockResponse(
                stock.getId(),
                itemMapper.toResponse(stock.getItem()),
                stock.getAvailableQuantity(),
                stock.getReservedQuantity(),
                totalQuantity
        );
    }
}

