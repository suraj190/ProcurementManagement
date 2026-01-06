package com.plant.procurement.store;

import com.plant.procurement.store.dto.StoreReturnCreateRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/store/returns")
public class StoreReturnController {

    private final StoreReturnRepository repository;
    private final StoreService service;

    public StoreReturnController(StoreReturnRepository repository,
                                 StoreService service) {
        this.repository = repository;
        this.service = service;
    }

    @GetMapping
    public List<StoreReturn> list() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StoreReturn> get(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<StoreReturn> create(@Valid @RequestBody StoreReturnCreateRequest request) {
        StoreReturn created = service.createReturn(request);
        return ResponseEntity.created(URI.create("/api/store/returns/" + created.getId()))
                .body(created);
    }
}

