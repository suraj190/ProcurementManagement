package com.plant.procurement.store;

import com.plant.procurement.master.Department;
import com.plant.procurement.master.DepartmentRepository;
import com.plant.procurement.master.Item;
import com.plant.procurement.master.ItemRepository;
import com.plant.procurement.requisition.Requisition;
import com.plant.procurement.requisition.RequisitionLine;
import com.plant.procurement.requisition.RequisitionRepository;
import com.plant.procurement.requisition.RequisitionStatus;
import com.plant.procurement.store.dto.StoreIssueCreateRequest;
import com.plant.procurement.store.dto.StoreIssueLineRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class StoreService {

    private final StoreStockRepository storeStockRepository;
    private final StoreIssueRepository storeIssueRepository;
    private final StoreReturnRepository storeReturnRepository;
    private final RequisitionRepository requisitionRepository;
    private final ItemRepository itemRepository;
    private final DepartmentRepository departmentRepository;

    public StoreService(StoreStockRepository storeStockRepository,
                       StoreIssueRepository storeIssueRepository,
                       StoreReturnRepository storeReturnRepository,
                       RequisitionRepository requisitionRepository,
                       ItemRepository itemRepository,
                       DepartmentRepository departmentRepository) {
        this.storeStockRepository = storeStockRepository;
        this.storeIssueRepository = storeIssueRepository;
        this.storeReturnRepository = storeReturnRepository;
        this.requisitionRepository = requisitionRepository;
        this.itemRepository = itemRepository;
        this.departmentRepository = departmentRepository;
    }

    /**
     * Check stock availability for items.
     * Returns list of items with available quantities.
     */
    @Transactional(readOnly = true)
    public List<StoreStock> checkStockAvailability(List<Long> itemIds) {
        List<StoreStock> stocks = new ArrayList<>();
        for (Long itemId : itemIds) {
            storeStockRepository.findByItemId(itemId)
                    .ifPresentOrElse(
                            stocks::add,
                            () -> {
                                // Create zero stock entry if item doesn't exist in store
                                Item item = itemRepository.findById(itemId)
                                        .orElseThrow(() -> new IllegalArgumentException("Invalid itemId: " + itemId));
                                StoreStock zeroStock = StoreStock.builder()
                                        .item(item)
                                        .availableQuantity(0.0)
                                        .reservedQuantity(0.0)
                                        .build();
                                stocks.add(zeroStock);
                            }
                    );
        }
        return stocks;
    }

    /**
     * Get stock for a specific item.
     */
    @Transactional(readOnly = true)
    public StoreStock getStockForItem(Long itemId) {
        return storeStockRepository.findByItemId(itemId)
                .orElseGet(() -> {
                    Item item = itemRepository.findById(itemId)
                            .orElseThrow(() -> new IllegalArgumentException("Invalid itemId: " + itemId));
                    return StoreStock.builder()
                            .item(item)
                            .availableQuantity(0.0)
                            .reservedQuantity(0.0)
                            .build();
                });
    }

    /**
     * Get all stocks in the store.
     */
    @Transactional(readOnly = true)
    public List<StoreStock> getAllStocks() {
        return storeStockRepository.findAll();
    }

    /**
     * Create a store issue against an approved requisition.
     * Supports partial issue - can issue less than requested quantity.
     */
    @Transactional
    public StoreIssue createIssue(StoreIssueCreateRequest request) {
        // Load requisition with all associations needed for issue processing
        Requisition requisition = requisitionRepository.findById(request.requisitionId())
                .orElseThrow(() -> new IllegalArgumentException("Requisition not found"));

        if (requisition.getStatus() != RequisitionStatus.APPROVED) {
            throw new IllegalStateException("Requisition must be APPROVED before issuing");
        }

        // Fetch any existing issues for this requisition so we don't over-issue
        List<StoreIssue> existingIssues = storeIssueRepository.findByRequisitionId(requisition.getId());

        Department department = departmentRepository.findById(requisition.getDepartment().getId())
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        StoreIssue issue = StoreIssue.builder()
                .requisition(requisition)
                .department(department)
                .issuedBy(request.issuedBy())
                .issueDate(request.issueDate() != null ? request.issueDate() : LocalDate.now())
                .remarks(request.remarks())
                .status(StoreIssueStatus.DRAFT)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        boolean allFullyIssued = true;
        boolean anyIssued = false;

        for (StoreIssueLineRequest lineReq : request.lines()) {
            RequisitionLine reqLine = requisition.getLines().stream()
                    .filter(line -> line.getId().equals(lineReq.requisitionLineId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Requisition line not found: " + lineReq.requisitionLineId()));

            // How much has already been issued for this requisition line?
            double alreadyIssued = existingIssues.stream()
                    .flatMap(existingIssue -> existingIssue.getLines().stream())
                    .filter(line -> line.getRequisitionLine() != null
                            && line.getRequisitionLine().getId().equals(reqLine.getId()))
                    .mapToDouble(StoreIssueLine::getIssuedQuantity)
                    .sum();

            double remainingQuantity = reqLine.getQuantity() - alreadyIssued;

            if (remainingQuantity <= 0) {
                throw new IllegalStateException(
                        "Requisition line already fully issued for item: " + reqLine.getItem().getCode());
            }

            if (lineReq.issuedQuantity() > remainingQuantity) {
                throw new IllegalArgumentException(
                        "Issued quantity cannot exceed remaining quantity for item: " + reqLine.getItem().getCode() +
                                ". Remaining: " + remainingQuantity +
                                ", Attempted: " + lineReq.issuedQuantity());
            }

            // Check stock availability
            StoreStock stock = getStockForItem(reqLine.getItem().getId());
            if (lineReq.issuedQuantity() > stock.getAvailableQuantity()) {
                throw new IllegalStateException(
                        "Insufficient stock for item: " + reqLine.getItem().getCode() +
                                ". Available: " + stock.getAvailableQuantity() +
                                ", Requested: " + lineReq.issuedQuantity());
            }

            StoreIssueLine issueLine = StoreIssueLine.builder()
                    .storeIssue(issue)
                    .item(reqLine.getItem())
                    .requisitionLine(reqLine)
                    .requestedQuantity(reqLine.getQuantity())
                    .issuedQuantity(lineReq.issuedQuantity())
                    .build();
            issue.getLines().add(issueLine);

            // Update stock
            stock.setAvailableQuantity(stock.getAvailableQuantity() - lineReq.issuedQuantity());
            storeStockRepository.save(stock);

            if (alreadyIssued + lineReq.issuedQuantity() < reqLine.getQuantity()) {
                allFullyIssued = false;
            }
            if (lineReq.issuedQuantity() > 0) {
                anyIssued = true;
            }
        }

        if (!anyIssued) {
            throw new IllegalStateException("At least one line must have issued quantity > 0");
        }

        // Determine status
        if (allFullyIssued) {
            issue.setStatus(StoreIssueStatus.ISSUED);
        } else {
            issue.setStatus(StoreIssueStatus.PARTIALLY_ISSUED);
        }

        StoreIssue saved = storeIssueRepository.save(issue);
        return storeIssueRepository.findById(saved.getId())
                .orElse(saved);
    }

    /**
     * Add stock to store (for inwarding/receipts).
     */
    @Transactional
    public StoreStock addStock(Long itemId, Double quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        StoreStock stock = storeStockRepository.findByItemId(itemId)
                .orElseGet(() -> {
                    Item item = itemRepository.findById(itemId)
                            .orElseThrow(() -> new IllegalArgumentException("Invalid itemId: " + itemId));
                    return StoreStock.builder()
                            .item(item)
                            .availableQuantity(0.0)
                            .reservedQuantity(0.0)
                            .build();
                });

        stock.setAvailableQuantity(stock.getAvailableQuantity() + quantity);
        return storeStockRepository.save(stock);
    }

    /**
     * Create a store return - increases stock when material is returned.
     */
    @Transactional
    public StoreReturn createReturn(com.plant.procurement.store.dto.StoreReturnCreateRequest request) {
        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid departmentId"));

        StoreReturn storeReturn = StoreReturn.builder()
                .department(department)
                .returnedBy(request.returnedBy())
                .returnDate(request.returnDate() != null ? request.returnDate() : java.time.LocalDate.now())
                .remarks(request.remarks())
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        // Link to store issue if provided
        if (request.storeIssueId() != null) {
            StoreIssue storeIssue = storeIssueRepository.findById(request.storeIssueId())
                    .orElseThrow(() -> new IllegalArgumentException("Store issue not found"));
            storeReturn.setStoreIssue(storeIssue);
        }

        for (com.plant.procurement.store.dto.StoreReturnLineRequest lineReq : request.lines()) {
            Item item = itemRepository.findById(lineReq.itemId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid itemId: " + lineReq.itemId()));

            StoreReturnLine returnLine = StoreReturnLine.builder()
                    .storeReturn(storeReturn)
                    .item(item)
                    .returnedQuantity(lineReq.returnedQuantity())
                    .reason(lineReq.reason())
                    .build();
            storeReturn.getLines().add(returnLine);

            // Increase stock
            StoreStock stock = getStockForItem(item.getId());
            stock.setAvailableQuantity(stock.getAvailableQuantity() + lineReq.returnedQuantity());
            storeStockRepository.save(stock);
        }

        return storeReturnRepository.save(storeReturn);
    }
}

