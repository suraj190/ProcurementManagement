package com.plant.procurement.requisition;

import com.plant.procurement.requisition.dto.RequisitionCreateRequest;
import com.plant.procurement.requisition.dto.RequisitionDecisionRequest;
import com.plant.procurement.requisition.dto.RequisitionListItemResponse;
import com.plant.procurement.requisition.dto.RequisitionResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/requisitions")
public class RequisitionController {

    private final RequisitionRepository requisitionRepository;
    private final RequisitionService requisitionService;
    private final RequisitionMapper requisitionMapper;

    public RequisitionController(RequisitionRepository requisitionRepository,
                                 RequisitionService requisitionService,
                                 RequisitionMapper requisitionMapper) {
        this.requisitionRepository = requisitionRepository;
        this.requisitionService = requisitionService;
        this.requisitionMapper = requisitionMapper;
    }

    @GetMapping
    public List<RequisitionListItemResponse> list() {
        return requisitionRepository.findAll().stream()
                .map(requisitionMapper::toListItemResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RequisitionResponse> get(@PathVariable Long id) {
        return requisitionRepository.findById(id)
                .map(requisitionMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RequisitionResponse> create(@Valid @RequestBody RequisitionCreateRequest request) {
        Requisition created = requisitionService.create(request);
        RequisitionResponse response = requisitionMapper.toResponse(created);
        return ResponseEntity.created(URI.create("/api/requisitions/" + created.getId()))
                .body(response);
    }

    @PostMapping("/{id}/approve-hod")
    public ResponseEntity<RequisitionResponse> approveByHod(@PathVariable Long id,
                                                    @Valid @RequestBody RequisitionDecisionRequest decision) {
        Requisition updated = requisitionService.approveByHod(id, decision);
        return ResponseEntity.ok(requisitionMapper.toResponse(updated));
    }

    @PostMapping("/{id}/reject-hod")
    public ResponseEntity<RequisitionResponse> rejectByHod(@PathVariable Long id,
                                                   @Valid @RequestBody RequisitionDecisionRequest decision) {
        Requisition updated = requisitionService.rejectByHod(id, decision);
        return ResponseEntity.ok(requisitionMapper.toResponse(updated));
    }

    @PostMapping("/{id}/approve-plant-head")
    public ResponseEntity<RequisitionResponse> approveByPlantHead(@PathVariable Long id,
                                                          @Valid @RequestBody RequisitionDecisionRequest decision) {
        Requisition updated = requisitionService.approveByPlantHead(id, decision);
        return ResponseEntity.ok(requisitionMapper.toResponse(updated));
    }

    @PostMapping("/{id}/reject-plant-head")
    public ResponseEntity<RequisitionResponse> rejectByPlantHead(@PathVariable Long id,
                                                         @Valid @RequestBody RequisitionDecisionRequest decision) {
        Requisition updated = requisitionService.rejectByPlantHead(id, decision);
        return ResponseEntity.ok(requisitionMapper.toResponse(updated));
    }
}


