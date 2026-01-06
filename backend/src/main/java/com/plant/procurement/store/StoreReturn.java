package com.plant.procurement.store;

import com.plant.procurement.master.Department;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "store_returns")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreReturn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String returnNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_issue_id")
    private StoreIssue storeIssue; // Optional - return can be standalone

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false, length = 100)
    private String returnedBy;

    private LocalDate returnDate;

    @Column(length = 500)
    private String remarks;

    @OneToMany(mappedBy = "storeReturn", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StoreReturnLine> lines = new ArrayList<>();

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

