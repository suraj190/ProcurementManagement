package com.plant.procurement.procurement;

import com.plant.procurement.procurement.dto.PurchaseOrderCreateRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderRepository repository;
    private final ProcurementService service;

    public PurchaseOrderController(PurchaseOrderRepository repository,
                                  ProcurementService service) {
        this.repository = repository;
        this.service = service;
    }

    @GetMapping
    public List<PurchaseOrder> list() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrder> get(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PurchaseOrder> create(@Valid @RequestBody PurchaseOrderCreateRequest request) {
        PurchaseOrder created = service.createPO(request);
        return ResponseEntity.created(URI.create("/api/purchase-orders/" + created.getId()))
                .body(created);
    }
}

