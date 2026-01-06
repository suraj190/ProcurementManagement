package com.plant.procurement.master;

import com.plant.procurement.master.dto.ItemMapper;
import com.plant.procurement.master.dto.ItemRequest;
import com.plant.procurement.master.dto.ItemResponse;
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
@RequestMapping("/api/items")
public class ItemController {

    private final ItemRepository repository;
    private final ItemMapper mapper;

    public ItemController(ItemRepository repository, ItemMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @GetMapping
    public List<ItemResponse> list() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> get(@PathVariable Long id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ItemResponse> create(@Valid @RequestBody ItemRequest request) {
        Item item = Item.builder()
                .code(request.code())
                .description(request.description())
                .uom(request.uom())
                .minStock(request.minStock())
                .reorderLevel(request.reorderLevel())
                .active(request.active() != null ? request.active() : true)
                .build();
        Item saved = repository.save(item);
        ItemResponse response = mapper.toResponse(saved);
        return ResponseEntity.created(URI.create("/api/items/" + saved.getId()))
                .body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemResponse> update(@PathVariable Long id,
                                       @Valid @RequestBody ItemRequest request) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setCode(request.code());
                    existing.setDescription(request.description());
                    existing.setUom(request.uom());
                    existing.setMinStock(request.minStock());
                    existing.setReorderLevel(request.reorderLevel());
                    existing.setActive(request.active() != null ? request.active() : existing.isActive());
                    Item saved = repository.save(existing);
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


