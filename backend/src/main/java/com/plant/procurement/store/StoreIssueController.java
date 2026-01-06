package com.plant.procurement.store;

import com.plant.procurement.store.dto.StoreIssueCreateRequest;
import com.plant.procurement.store.dto.StoreIssueResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/store/issues")
public class StoreIssueController {

    private final StoreIssueRepository storeIssueRepository;
    private final StoreService storeService;
    private final StoreIssueMapper mapper;

    public StoreIssueController(StoreIssueRepository storeIssueRepository,
                                StoreService storeService,
                                StoreIssueMapper mapper) {
        this.storeIssueRepository = storeIssueRepository;
        this.storeService = storeService;
        this.mapper = mapper;
    }

    @GetMapping
    public List<StoreIssueResponse> list() {
        return storeIssueRepository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StoreIssueResponse> get(@PathVariable Long id) {
        return storeIssueRepository.findById(id)
                .map(mapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/requisition/{requisitionId}")
    public List<StoreIssueResponse> getByRequisition(@PathVariable Long requisitionId) {
        return storeIssueRepository.findByRequisitionId(requisitionId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<StoreIssueResponse> create(@Valid @RequestBody StoreIssueCreateRequest request) {
        StoreIssue created = storeService.createIssue(request);
        StoreIssueResponse response = mapper.toResponse(created);
        return ResponseEntity.created(URI.create("/api/store/issues/" + created.getId()))
                .body(response);
    }
}

