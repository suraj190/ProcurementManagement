package com.plant.procurement.master.dto;

import com.plant.procurement.master.Department;
import org.springframework.stereotype.Component;

@Component
public class DepartmentMapper {

    public DepartmentResponse toResponse(Department department) {
        if (department == null) {
            return null;
        }

        return new DepartmentResponse(
                department.getId(),
                department.getCode(),
                department.getName(),
                department.isActive()
        );
    }
}

