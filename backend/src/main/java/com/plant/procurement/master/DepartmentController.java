package com.plant.procurement.master;

import com.plant.procurement.master.dto.DepartmentMapper;
import com.plant.procurement.master.dto.DepartmentRequest;
import com.plant.procurement.master.dto.DepartmentResponse;
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
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentRepository repository;
    private final DepartmentMapper mapper;

    public DepartmentController(DepartmentRepository repository, DepartmentMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @GetMapping
    public List<DepartmentResponse> list() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentResponse> get(@PathVariable Long id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DepartmentResponse> create(@Valid @RequestBody DepartmentRequest request) {
        Department department = Department.builder()
                .code(request.code())
                .name(request.name())
                .active(request.active() != null ? request.active() : true)
                .build();
        Department saved = repository.save(department);
        DepartmentResponse response = mapper.toResponse(saved);
        return ResponseEntity.created(URI.create("/api/departments/" + saved.getId()))
                .body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DepartmentResponse> update(@PathVariable Long id,
                                             @Valid @RequestBody DepartmentRequest request) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setCode(request.code());
                    existing.setName(request.name());
                    existing.setActive(request.active() != null ? request.active() : existing.isActive());
                    Department saved = repository.save(existing);
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


