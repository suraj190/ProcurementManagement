package com.plant.procurement.store;

import com.plant.procurement.store.dto.StoreStockResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/store/stocks")
public class StoreStockController {

    private final StoreService storeService;
    private final StoreStockMapper mapper;

    public StoreStockController(StoreService storeService, StoreStockMapper mapper) {
        this.storeService = storeService;
        this.mapper = mapper;
    }

    @GetMapping
    public List<StoreStockResponse> listAll() {
        return storeService.getAllStocks().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<StoreStockResponse> getByItem(@PathVariable Long itemId) {
        StoreStock stock = storeService.getStockForItem(itemId);
        return ResponseEntity.ok(mapper.toResponse(stock));
    }

    @PostMapping("/item/{itemId}/add")
    public ResponseEntity<StoreStockResponse> addStock(
            @PathVariable Long itemId,
            @Valid @RequestBody AddStockRequest request) {
        StoreStock updated = storeService.addStock(itemId, request.quantity());
        return ResponseEntity.ok(mapper.toResponse(updated));
    }

    @PostMapping("/check-availability")
    public List<StoreStockResponse> checkAvailability(@Valid @RequestBody CheckAvailabilityRequest request) {
        return storeService.checkStockAvailability(request.itemIds()).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public record AddStockRequest(
            @NotNull
            @Min(0)
            Double quantity
    ) {
    }

    public record CheckAvailabilityRequest(
            @NotNull
            List<@NotNull Long> itemIds
    ) {
    }
}

