package com.plant.procurement.master;

import com.plant.procurement.master.dto.VendorMapper;
import com.plant.procurement.master.dto.VendorRequest;
import com.plant.procurement.master.dto.VendorResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final VendorRepository repository;
    private final VendorMapper mapper;

    public VendorController(VendorRepository repository, VendorMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @GetMapping
    public List<VendorResponse> list() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendorResponse> get(@PathVariable Long id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<VendorResponse> create(@Valid @RequestBody VendorRequest request) {
        Vendor vendor = Vendor.builder()
                .code(request.code())
                .name(request.name())
                .gstNumber(request.gstNumber())
                .contactEmail(request.contactEmail())
                .contactPhone(request.contactPhone())
                .active(request.active() != null ? request.active() : true)
                .build();
        Vendor saved = repository.save(vendor);
        VendorResponse response = mapper.toResponse(saved);
        return ResponseEntity.created(URI.create("/api/vendors/" + saved.getId()))
                .body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VendorResponse> update(@PathVariable Long id,
                                         @Valid @RequestBody VendorRequest request) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setCode(request.code());
                    existing.setName(request.name());
                    existing.setGstNumber(request.gstNumber());
                    existing.setContactEmail(request.contactEmail());
                    existing.setContactPhone(request.contactPhone());
                    existing.setActive(request.active() != null ? request.active() : existing.isActive());
                    Vendor saved = repository.save(existing);
                    return ResponseEntity.ok(mapper.toResponse(saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}


