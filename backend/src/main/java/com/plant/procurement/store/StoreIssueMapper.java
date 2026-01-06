package com.plant.procurement.store;

import com.plant.procurement.master.dto.DepartmentMapper;
import com.plant.procurement.master.dto.ItemMapper;
import com.plant.procurement.requisition.RequisitionMapper;
import com.plant.procurement.store.dto.StoreIssueLineResponse;
import com.plant.procurement.store.dto.StoreIssueResponse;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class StoreIssueMapper {

    private final RequisitionMapper requisitionMapper;
    private final DepartmentMapper departmentMapper;
    private final ItemMapper itemMapper;

    public StoreIssueMapper(RequisitionMapper requisitionMapper,
                           DepartmentMapper departmentMapper,
                           ItemMapper itemMapper) {
        this.requisitionMapper = requisitionMapper;
        this.departmentMapper = departmentMapper;
        this.itemMapper = itemMapper;
    }

    public StoreIssueResponse toResponse(StoreIssue issue) {
        if (issue == null) {
            return null;
        }

        return new StoreIssueResponse(
                issue.getId(),
                issue.getIssueNumber(),
                requisitionMapper.toListItemResponse(issue.getRequisition()),
                departmentMapper.toResponse(issue.getDepartment()),
                issue.getIssuedBy(),
                issue.getIssueDate(),
                issue.getRemarks(),
                issue.getStatus(),
                issue.getLines() != null
                        ? issue.getLines().stream()
                        .map(this::toLineResponse)
                        .collect(Collectors.toList())
                        : null,
                issue.getCreatedAt(),
                issue.getUpdatedAt()
        );
    }

    private StoreIssueLineResponse toLineResponse(StoreIssueLine line) {
        if (line == null) {
            return null;
        }

        return new StoreIssueLineResponse(
                line.getId(),
                itemMapper.toResponse(line.getItem()),
                line.getRequestedQuantity(),
                line.getIssuedQuantity()
        );
    }
}

