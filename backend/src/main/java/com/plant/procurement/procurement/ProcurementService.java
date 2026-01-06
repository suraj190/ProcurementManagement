package com.plant.procurement.procurement;

import com.plant.procurement.master.Department;
import com.plant.procurement.master.DepartmentRepository;
import com.plant.procurement.master.Item;
import com.plant.procurement.master.ItemRepository;
import com.plant.procurement.master.Vendor;
import com.plant.procurement.master.VendorRepository;
import com.plant.procurement.procurement.dto.GRNCreateRequest;
import com.plant.procurement.procurement.dto.PurchaseOrderCreateRequest;
import com.plant.procurement.procurement.dto.PurchaseRequisitionCreateRequest;
import com.plant.procurement.requisition.Requisition;
import com.plant.procurement.requisition.RequisitionRepository;
import com.plant.procurement.store.StoreService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Service
public class ProcurementService {

    private final PurchaseRequisitionRepository prRepository;
    private final PurchaseOrderRepository poRepository;
    private final GoodsReceiptRepository grnRepository;
    private final RequisitionRepository requisitionRepository;
    private final DepartmentRepository departmentRepository;
    private final ItemRepository itemRepository;
    private final VendorRepository vendorRepository;
    private final StoreService storeService;

    public ProcurementService(PurchaseRequisitionRepository prRepository,
                             PurchaseOrderRepository poRepository,
                             GoodsReceiptRepository grnRepository,
                             RequisitionRepository requisitionRepository,
                             DepartmentRepository departmentRepository,
                             ItemRepository itemRepository,
                             VendorRepository vendorRepository,
                             StoreService storeService) {
        this.prRepository = prRepository;
        this.poRepository = poRepository;
        this.grnRepository = grnRepository;
        this.requisitionRepository = requisitionRepository;
        this.departmentRepository = departmentRepository;
        this.itemRepository = itemRepository;
        this.vendorRepository = vendorRepository;
        this.storeService = storeService;
    }

    @Transactional
    public PurchaseRequisition createPR(PurchaseRequisitionCreateRequest request) {
        PurchaseRequisition pr = PurchaseRequisition.builder()
                .requestedBy(request.requestedBy())
                .requiredByDate(request.requiredByDate())
                .remarks(request.remarks())
                .status(PurchaseRequisitionStatus.DRAFT)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        if (request.requisitionId() != null) {
            Requisition requisition = requisitionRepository.findById(request.requisitionId())
                    .orElseThrow(() -> new IllegalArgumentException("Requisition not found"));
            pr.setRequisition(requisition);
            pr.setDepartment(requisition.getDepartment());
        } else if (request.departmentId() != null) {
            Department dept = departmentRepository.findById(request.departmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid departmentId"));
            pr.setDepartment(dept);
        }

        for (com.plant.procurement.procurement.dto.PurchaseRequisitionLineRequest lineReq : request.lines()) {
            Item item = itemRepository.findById(lineReq.itemId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid itemId: " + lineReq.itemId()));

            PurchaseRequisitionLine line = PurchaseRequisitionLine.builder()
                    .purchaseRequisition(pr)
                    .item(item)
                    .quantity(lineReq.quantity())
                    .purpose(lineReq.purpose())
                    .build();
            pr.getLines().add(line);
        }

        return prRepository.save(pr);
    }

    @Transactional
    public PurchaseOrder createPO(PurchaseOrderCreateRequest request) {
        PurchaseRequisition pr = prRepository.findById(request.purchaseRequisitionId())
                .orElseThrow(() -> new IllegalArgumentException("Purchase Requisition not found"));

        Vendor vendor = vendorRepository.findById(request.vendorId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid vendorId"));

        PurchaseOrder po = PurchaseOrder.builder()
                .purchaseRequisition(pr)
                .vendor(vendor)
                .createdBy(request.createdBy())
                .orderDate(request.orderDate() != null ? request.orderDate() : LocalDate.now())
                .expectedDeliveryDate(request.expectedDeliveryDate())
                .remarks(request.remarks())
                .status(PurchaseOrderStatus.DRAFT)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        if (request.departmentId() != null) {
            Department dept = departmentRepository.findById(request.departmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid departmentId"));
            po.setDepartment(dept);
        } else if (pr.getDepartment() != null) {
            po.setDepartment(pr.getDepartment());
        }

        for (com.plant.procurement.procurement.dto.PurchaseOrderLineRequest lineReq : request.lines()) {
            PurchaseRequisitionLine prLine = pr.getLines().stream()
                    .filter(l -> l.getId().equals(lineReq.purchaseRequisitionLineId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException(
                            "PR line not found: " + lineReq.purchaseRequisitionLineId()));

            Item item = itemRepository.findById(lineReq.itemId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid itemId: " + lineReq.itemId()));

            BigDecimal totalAmount = lineReq.unitPrice().multiply(BigDecimal.valueOf(lineReq.quantity()));

            PurchaseOrderLine poLine = PurchaseOrderLine.builder()
                    .purchaseOrder(po)
                    .item(item)
                    .quantity(lineReq.quantity())
                    .unitPrice(lineReq.unitPrice())
                    .totalAmount(totalAmount)
                    .remarks(lineReq.remarks())
                    .build();
            po.getLines().add(poLine);
        }

        return poRepository.save(po);
    }

    @Transactional
    public GoodsReceipt createGRN(GRNCreateRequest request) {
        PurchaseOrder po = poRepository.findById(request.purchaseOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Purchase Order not found"));

        GoodsReceipt grn = GoodsReceipt.builder()
                .purchaseOrder(po)
                .vendor(po.getVendor())
                .department(po.getDepartment())
                .receivedBy(request.receivedBy())
                .receiptDate(request.receiptDate() != null ? request.receiptDate() : LocalDate.now())
                .remarks(request.remarks())
                .status(GRNStatus.RECEIVED)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        for (com.plant.procurement.procurement.dto.GRNLineRequest lineReq : request.lines()) {
            PurchaseOrderLine poLine = po.getLines().stream()
                    .filter(l -> l.getId().equals(lineReq.purchaseOrderLineId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException(
                            "PO line not found: " + lineReq.purchaseOrderLineId()));

            if (lineReq.receivedQuantity() > poLine.getQuantity()) {
                throw new IllegalArgumentException(
                        "Received quantity cannot exceed ordered quantity for item: " + poLine.getItem().getCode());
            }

            Item item = itemRepository.findById(lineReq.itemId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid itemId: " + lineReq.itemId()));

            GoodsReceiptLine grnLine = GoodsReceiptLine.builder()
                    .goodsReceipt(grn)
                    .purchaseOrderLine(poLine)
                    .item(item)
                    .orderedQuantity(poLine.getQuantity())
                    .receivedQuantity(lineReq.receivedQuantity())
                    .build();
            grn.getLines().add(grnLine);

            // Add stock to store
            storeService.addStock(item.getId(), lineReq.receivedQuantity());
        }

        // Update PO status
        boolean allReceived = po.getLines().stream()
                .allMatch(poLine -> grn.getLines().stream()
                        .anyMatch(grnLine -> grnLine.getPurchaseOrderLine().getId().equals(poLine.getId())
                                && grnLine.getReceivedQuantity() >= poLine.getQuantity()));

        if (allReceived) {
            po.setStatus(PurchaseOrderStatus.FULLY_RECEIVED);
        } else {
            po.setStatus(PurchaseOrderStatus.PARTIALLY_RECEIVED);
        }
        poRepository.save(po);

        return grnRepository.save(grn);
    }
}

