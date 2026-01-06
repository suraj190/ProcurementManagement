package com.plant.procurement.procurement;

import com.plant.procurement.procurement.dto.PurchaseRequisitionCreateRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/purchase-requisitions")
public class PurchaseRequisitionController {

    private final PurchaseRequisitionRepository repository;
    private final ProcurementService service;

    public PurchaseRequisitionController(PurchaseRequisitionRepository repository,
                                        ProcurementService service) {
        this.repository = repository;
        this.service = service;
    }

    @GetMapping
    public List<PurchaseRequisition> list() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseRequisition> get(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PurchaseRequisition> create(@Valid @RequestBody PurchaseRequisitionCreateRequest request) {
        PurchaseRequisition created = service.createPR(request);
        return ResponseEntity.created(URI.create("/api/purchase-requisitions/" + created.getId()))
                .body(created);
    }
}

