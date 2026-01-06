package com.plant.procurement.store;

import com.plant.procurement.master.Department;
import com.plant.procurement.requisition.Requisition;
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
@Table(name = "store_issues")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String issueNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisition_id", nullable = false)
    private Requisition requisition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false, length = 100)
    private String issuedBy;

    private LocalDate issueDate;

    @Column(length = 500)
    private String remarks;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StoreIssueStatus status;

    @OneToMany(mappedBy = "storeIssue", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StoreIssueLine> lines = new ArrayList<>();

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

