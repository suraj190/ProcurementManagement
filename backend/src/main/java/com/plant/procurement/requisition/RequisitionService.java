package com.plant.procurement.requisition;

import com.plant.procurement.master.Department;
import com.plant.procurement.master.DepartmentRepository;
import com.plant.procurement.master.Item;
import com.plant.procurement.master.ItemRepository;
import com.plant.procurement.requisition.dto.RequisitionCreateRequest;
import com.plant.procurement.requisition.dto.RequisitionDecisionRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class RequisitionService {

    private final RequisitionRepository requisitionRepository;
    private final DepartmentRepository departmentRepository;
    private final ItemRepository itemRepository;

    public RequisitionService(RequisitionRepository requisitionRepository,
                              DepartmentRepository departmentRepository,
                              ItemRepository itemRepository) {
        this.requisitionRepository = requisitionRepository;
        this.departmentRepository = departmentRepository;
        this.itemRepository = itemRepository;
    }

    @Transactional
    public Requisition create(RequisitionCreateRequest request) {
        Department dept = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid departmentId"));

        Requisition requisition = Requisition.builder()
                .department(dept)
                .requestedBy(request.requestedBy())
                .requiredByDate(request.requiredByDate())
                .remarks(request.remarks())
                .status(RequisitionStatus.PENDING_HOD_APPROVAL)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        request.lines().forEach(lineReq -> {
            Item item = itemRepository.findById(lineReq.itemId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid itemId: " + lineReq.itemId()));

            RequisitionLine line = RequisitionLine.builder()
                    .requisition(requisition)
                    .item(item)
                    .quantity(lineReq.quantity())
                    .purpose(lineReq.purpose())
                    .build();
            requisition.getLines().add(line);
        });

        Requisition saved = requisitionRepository.save(requisition);
        // Reload with eager fetching to ensure all associations are loaded for JSON serialization
        return requisitionRepository.findById(saved.getId())
                .orElse(saved);
    }

    @Transactional
    public Requisition approveByHod(Long id, RequisitionDecisionRequest decision) {
        Requisition req = load(id);
        if (req.getStatus() != RequisitionStatus.PENDING_HOD_APPROVAL) {
            throw new IllegalStateException("Requisition not pending HOD approval");
        }
        req.setStatus(RequisitionStatus.PENDING_PLANT_HEAD_APPROVAL);
        req.setUpdatedAt(OffsetDateTime.now());
        req.setHodActionAt(OffsetDateTime.now());
        requisitionRepository.save(req);
        // Reload with eager fetching to ensure all associations are loaded for JSON serialization
        return requisitionRepository.findById(req.getId())
                .orElse(req);
    }

    @Transactional
    public Requisition rejectByHod(Long id, RequisitionDecisionRequest decision) {
        Requisition req = load(id);
        if (req.getStatus() != RequisitionStatus.PENDING_HOD_APPROVAL) {
            throw new IllegalStateException("Requisition not pending HOD approval");
        }
        req.setStatus(RequisitionStatus.REJECTED_BY_HOD);
        req.setUpdatedAt(OffsetDateTime.now());
        req.setHodActionAt(OffsetDateTime.now());
        requisitionRepository.save(req);
        // Reload with eager fetching to ensure all associations are loaded for JSON serialization
        return requisitionRepository.findById(req.getId())
                .orElse(req);
    }

    @Transactional
    public Requisition approveByPlantHead(Long id, RequisitionDecisionRequest decision) {
        Requisition req = load(id);
        if (req.getStatus() != RequisitionStatus.PENDING_PLANT_HEAD_APPROVAL) {
            throw new IllegalStateException("Requisition not pending Plant Head approval");
        }
        req.setStatus(RequisitionStatus.APPROVED);
        req.setUpdatedAt(OffsetDateTime.now());
        req.setPlantHeadActionAt(OffsetDateTime.now());
        requisitionRepository.save(req);
        // Reload with eager fetching to ensure all associations are loaded for JSON serialization
        return requisitionRepository.findById(req.getId())
                .orElse(req);
    }

    @Transactional
    public Requisition rejectByPlantHead(Long id, RequisitionDecisionRequest decision) {
        Requisition req = load(id);
        if (req.getStatus() != RequisitionStatus.PENDING_PLANT_HEAD_APPROVAL) {
            throw new IllegalStateException("Requisition not pending Plant Head approval");
        }
        req.setStatus(RequisitionStatus.REJECTED_BY_PLANT_HEAD);
        req.setUpdatedAt(OffsetDateTime.now());
        req.setPlantHeadActionAt(OffsetDateTime.now());
        requisitionRepository.save(req);
        // Reload with eager fetching to ensure all associations are loaded for JSON serialization
        return requisitionRepository.findById(req.getId())
                .orElse(req);
    }

    private Requisition load(Long id) {
        // Using findById with @EntityGraph to eagerly load associations
        return requisitionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Requisition not found: " + id));
    }
}


