package com.plant.procurement.procurement;

import com.plant.procurement.procurement.dto.GRNCreateRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/grns")
public class GRNController {

    private final GoodsReceiptRepository repository;
    private final ProcurementService service;

    public GRNController(GoodsReceiptRepository repository,
                        ProcurementService service) {
        this.repository = repository;
        this.service = service;
    }

    @GetMapping
    public List<GoodsReceipt> list() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoodsReceipt> get(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<GoodsReceipt> create(@Valid @RequestBody GRNCreateRequest request) {
        GoodsReceipt created = service.createGRN(request);
        return ResponseEntity.created(URI.create("/api/grns/" + created.getId()))
                .body(created);
    }
}

