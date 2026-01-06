package com.plant.procurement.requisition;

import com.plant.procurement.master.dto.DepartmentMapper;
import com.plant.procurement.master.dto.ItemMapper;
import com.plant.procurement.requisition.dto.RequisitionLineResponse;
import com.plant.procurement.requisition.dto.RequisitionListItemResponse;
import com.plant.procurement.requisition.dto.RequisitionResponse;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class RequisitionMapper {

    private final DepartmentMapper departmentMapper;
    private final ItemMapper itemMapper;

    public RequisitionMapper(DepartmentMapper departmentMapper, ItemMapper itemMapper) {
        this.departmentMapper = departmentMapper;
        this.itemMapper = itemMapper;
    }

    public RequisitionResponse toResponse(Requisition requisition) {
        if (requisition == null) {
            return null;
        }

        return new RequisitionResponse(
                requisition.getId(),
                requisition.getReqNumber(),
                departmentMapper.toResponse(requisition.getDepartment()),
                requisition.getRequestedBy(),
                requisition.getRequiredByDate(),
                requisition.getRemarks(),
                requisition.getStatus(),
                requisition.getLines() != null
                        ? requisition.getLines().stream()
                        .map(this::toLineResponse)
                        .collect(Collectors.toList())
                        : null,
                requisition.getCreatedAt(),
                requisition.getUpdatedAt(),
                requisition.getHodActionAt(),
                requisition.getPlantHeadActionAt()
        );
    }

    public RequisitionListItemResponse toListItemResponse(Requisition requisition) {
        if (requisition == null) {
            return null;
        }

        return new RequisitionListItemResponse(
                requisition.getId(),
                requisition.getReqNumber(),
                departmentMapper.toResponse(requisition.getDepartment()),
                requisition.getRequestedBy(),
                requisition.getRequiredByDate(),
                requisition.getStatus(),
                requisition.getLines() != null ? requisition.getLines().size() : 0,
                requisition.getCreatedAt(),
                requisition.getUpdatedAt()
        );
    }

    private RequisitionLineResponse toLineResponse(RequisitionLine line) {
        if (line == null) {
            return null;
        }

        return new RequisitionLineResponse(
                line.getId(),
                itemMapper.toResponse(line.getItem()),
                line.getQuantity(),
                line.getPurpose()
        );
    }
}

